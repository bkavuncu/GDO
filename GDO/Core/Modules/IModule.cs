namespace GDO.Core.Modules
{
    public interface IModule
    {
        string Name { get; set; }
        void Init();
    }
}