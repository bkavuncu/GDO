using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using GDO.Apps.SigmaGraph.QuadTree.Utilities;

namespace GDO.Apps.SigmaGraph.QuadTree
{
    public abstract class AConcurrentQuadTreeFactory<T> where T : IQuadable<double>
    {
        protected int Maxbags;
        protected int MaxobjectPerBag;
        protected int MaxWorklistSize;
        protected int Delay;
        public QuadTree<T> QuadTree { get; protected set; }

        protected readonly ConcurrentQueue<Tuple<string, List<T>>> Worklist =
            new ConcurrentQueue<Tuple<string, List<T>>>();

        protected readonly ConcurrentDictionary<string, QuadTreeNode<T>> Quads =
            new ConcurrentDictionary<string, QuadTreeNode<T>>();

        protected ConcurrentQueue<string> LogMessages = new ConcurrentQueue<string>();

        private int _addtasks;
        private int _worktasks;
        private int _reworktasks;

        private int Totalthreads => _worktasks + _addtasks + _reworktasks;

        private SemaphoreSlim _completionSemaphore;
        private SemaphoreSlim _adderCompletionSemaphore;
        private SemaphoreSlim _workerCompletionSemaphore;
        private SemaphoreSlim _reworkCompletionSemaphore;

        /// <summary>
        /// a semaphore to prevent multiple concurrent use of this class
        /// </summary>
        // ReSharper disable once MemberCanBePrivate.Global - this will be needed by implementors
        protected readonly SemaphoreSlim CurrentlyAdding = new SemaphoreSlim(1, 1);

        /// <summary>
        /// Removes a bag of objects from Quadtree c# memory to remote storage
        /// </summary>
        /// <param name="obj">The object.</param>
        protected abstract void ShedObjects(QuadTreeBag<T> obj);

        /// <summary>
        /// Registers the quad in a database of guid's
        /// </summary>
        /// <param name="guid">The unique identifier.</param>
        /// <param name="quad">The quad.</param>
        protected abstract void RegisterQuad(string guid, QuadTreeNode<T> quad);

        /// <summary>
        /// Marks the bags of objects pushed from one quadtreeNode for rework.
        /// This happens when a leaf becomes a node 
        /// </summary>
        /// <param name="quadGuid">The quad unique identifier.</param>
        protected abstract void MarkObjectsForRework(string quadGuid);

        /// <summary>
        /// Concurrently adds objects - using as many threads as there are items in the list
        /// </summary>
        /// <param name="addObjects">The add objects. we group objects into List(T)s we have an unknown number of these groups and many threads and provide</param>
        /// <param name="workthreads">The number of workthreads.</param>
        /// <param name="reworkthreads">The number of reworkthreads.</param>
        /// <returns>if it succeeded</returns>
        public bool ConcurrentAdd(List<IEnumerable<List<T>>> addObjects, int workthreads = 1, int reworkthreads = 1)
        {

            Log("---- ConcurrentAdd ----");
            // check nothing else is running
            if (!CurrentlyAdding.WaitAsync(1000).Result) return false; // todo test

            LogMessages = new ConcurrentQueue<string>();
            SetupCountersAndSemaphores(addObjects.Count, workthreads, reworkthreads);
            List<Task> addtasks = StartAddTasks(addObjects);
            List<Task> workertasks = StartWorkerTasks(_worktasks);
            List<Task> reworkertasks = StartReWorkerTasks(_reworktasks);
            List<Task> alltasks = addtasks.Concat(workertasks).Concat(reworkertasks).ToList();
            Task continuation = Task.WhenAll(alltasks);

            continuation.Wait();

            // double check that we're finished
            for (int i = 0; i < Totalthreads; i++) {
                _completionSemaphore.Wait();
            }

            // allow others to use the class
            CurrentlyAdding.Release();
            return continuation.Status == TaskStatus.RanToCompletion;
        }

        private void SetupCountersAndSemaphores(int addthreads, int workthreads, int reworkthreads)
        {
            this._addtasks = addthreads;
            this._worktasks = workthreads;
            this._reworktasks = reworkthreads;
            this._completionSemaphore = new SemaphoreSlim(0, Totalthreads);
            this._adderCompletionSemaphore = new SemaphoreSlim(0, _addtasks);
            this._workerCompletionSemaphore = new SemaphoreSlim(0, _worktasks);
            this._reworkCompletionSemaphore = new SemaphoreSlim(0, _reworktasks);
        }

        // Number of threads, groups of objects per thread, objects per groups
        private List<Task> StartAddTasks(List<IEnumerable<List<T>>> addObjects)
        {
            Log("Starting Add tasks");
            List<Task> tasks = new List<Task>();
            foreach (IEnumerable<List<T>> listofWork in addObjects)
            {
                tasks.Add(Task.Run(async () => {
                    // ReSharper disable once PossibleMultipleEnumeration - db805 i dont see how
                    Log("Started adder Thread");
                    foreach (List<T> o in listofWork) {
                        while (Worklist.Count > MaxWorklistSize) {
                            Log("Worklist full - adder sleeping");
                            await Task.Delay(Delay).ConfigureAwait(false);
                            //this seems dangerous as we may lose o ?? ... aprarently we do not 
                            // note that this will not stop adding items, just slow down the rate of addition to the worklist
                        }
                        Worklist.Enqueue(new Tuple<string, List<T>>(QuadTree.Root.Guid, o));
                    }
                    Log("Finished adder Thread");
                    this._adderCompletionSemaphore.Release();
                    this._completionSemaphore.Release();
                }));
            }
            Log("Finished creating Add tasks");
            return tasks;
        }


        private List<Task> StartWorkerTasks(int worktasks)
        {
            Log("Starting Worker tasks");
            List<Task> tasks = new List<Task>();
            for (int workerid = 0; workerid < worktasks; workerid++) {
                tasks.Add(Task.Run(async () => {

                    try {
                        Log("Started worker Thread");
                        // Stop criteria: All the objects were pushed by the adder thread, and there is no Rework and the worklist is empty 
                        while (this._adderCompletionSemaphore.CurrentCount != _addtasks || !ReworkQueueEmpty() ||
                               !Worklist.IsEmpty) {
                            // try and get some work
                            Tuple<string, List<T>> workitem;
                            while (Worklist.TryDequeue(out workitem)) {
                                // this second loop is an optimisation 
                                // get the quadtree workitem.Item1 by its id
                                try {
                                    QuadTreeNode<T> quad = Quads[workitem.Item1];
                                    // if this throws we have a big problem 

                                    foreach (T o in workitem.Item2) {
                                        QuadTree.AddObject(quad, o);
                                    }
                                }
                                catch (Exception e) {
                                    Console.WriteLine(e);
                                }
                            }
                            Log("no work for worker,sleeping, _adderCompletionSemaphore.CurrentCount: "+ _adderCompletionSemaphore.CurrentCount+ ", ReworkQueueEmpty(): "+ ReworkQueueEmpty()+ ", _reworkCompletionSemaphore.CurrentCount: " + _reworkCompletionSemaphore.CurrentCount);
                            await Task.Delay(Delay).ConfigureAwait(false); // we have no context to return to 
                            Log("no work for worker,awake");
                        }
                        Log("Finished worker  Thread");
                    }
                    catch (Exception e) {
                        Console.WriteLine(e);
                    }
                    this._workerCompletionSemaphore.Release();
                    this._completionSemaphore.Release();
                }));
            }
            Log("Finished creating worker tasks");
            return tasks;
        }

        private List<Task> StartReWorkerTasks(int reworktasks)
        {
            Log("Starting reWorker tasks");
            List<Task> tasks = new List<Task>();

            for (int workerid = 0; workerid < reworktasks; workerid++)
            {
                tasks.Add(
                    Task.Run(async () => {
                        Log("Started reworker Thread");
                        // Stop criteria: Adder pushed all its objects, and there is no object within the Mongo to repush inside the worklist, and No object flagged within the Mongo
                        //while (_adderCompletionSemaphore.CurrentCount != _addtasks || !Worklist.IsEmpty || !ReworkQueueEmpty())

                        try {

                        

                        while (!Worklist.IsEmpty || !ReworkQueueEmpty() ||
                               _adderCompletionSemaphore.CurrentCount != _addtasks || _workerCompletionSemaphore.CurrentCount != _worktasks)
                        {

                            // try get a bag to work with
                            bool foundobj = true;
                            // while the worklist isnt full and we can still find objs
                            while (Worklist.Count <= MaxWorklistSize && foundobj)
                            {
                                QuadTreeBag<T> bag;
                                if (GetReworkBag(out bag, QuadTree.treeId))
                                {
                                    Worklist.Enqueue(new Tuple<string, List<T>>(bag.quadId, bag.Objects));
                                    Log("Found a bag to rework");
                                }
                                else
                                {
                                    foundobj = false;
                                    Log("Found no bags to rework, sleeping");
                                }

                            }
                            if (Worklist.Count >= MaxWorklistSize)
                            {
                                Log("worklist full reworker going to sleep");
                            }
                            await Task.Delay(Delay).ConfigureAwait(false); // we have no context to return to 
                        }


                        if (!ReworkQueueEmpty())
                        {
                            throw new Exception("failed, at the end of the reworker loop, ReworkQueueEmpty is false!");
                        }

                        Log("Finished reworker Thread");
                        this._reworkCompletionSemaphore.Release();
                        this._completionSemaphore.Release();

                        }
                        catch (Exception e)
                        {
                            Console.WriteLine(e);
                            throw;
                        }
                    }));
            }
            Log("Finished creating reworker tasks");
            return tasks;
        }


        protected abstract bool ReworkQueueEmpty();

        //protected abstract bool GetReworkBag(out QuadTreeBag<T> bag);        
        public abstract bool GetReworkBag(out QuadTreeBag<T> bag);

        public abstract bool GetReworkBag(out QuadTreeBag<T> bag, string treeId);


        private void Log(string msg)
        {
            //todo eventually this Q will become huge! need to add an option in this class to turn it off
            //this.LogMessages.Enqueue(DateTime.Now + " [" + Task.CurrentId + "]" + msg);
            // todo somewhere the task id is getting lost? this is because of the awaiting 
            Console.WriteLine(DateTime.Now + " [" + Task.CurrentId + "]" + msg);
        }

        public string GetLog()
        {
            return LogMessages.ToArray().Aggregate("", (next, acc) => acc + Environment.NewLine + next);
        }

        /// <summary>
        /// Determines whether the factory has terminated with clean state - e.g. worklist and reworklist are empty 
        /// </summary>
        /// <returns></returns>
        public abstract bool HasCleanState();

        public abstract int TotalObjectsInStorage();

        public abstract string PrintShedBags();

        public virtual string PrintState()
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine($"adders {this._adderCompletionSemaphore.CurrentCount}/{_addtasks} finished");
            sb.AppendLine($"workers {this._workerCompletionSemaphore.CurrentCount}/{_worktasks} finished");
            sb.AppendLine($"reworkers {this._reworkCompletionSemaphore.CurrentCount}/{_reworktasks} finished");
            sb.AppendLine($"worklist = {this.Worklist.Count}");
            sb.AppendLine();
            return sb.ToString();

        }

        public string PrintQuad()
        {
            return this.QuadTree.PrintQuad(this);
        }

        public abstract QuadTreeBag<T>[] GetBagsForQuad(QuadTreeNode<T> quad);
    }
}