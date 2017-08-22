#Distributed Graph Renderer

This distributed graph visualisation app is integrated with Gephi and supports visualisation of any graph built using Gephi. It automatically transforms graph based on GDO configuration, and it supports various interactive features such as panning, zooming and searching. Before we visualise it, we need to export the graph from Gephi as graphml.

##Instructions for rendering a graph
1. Switch maintenance mode off.
2. Create a new section.
3. In that section, start up a new instance of the SigmaGraph app.
4. Go to the control UI for the app instance you just created.
5. In the Upload Graph section, press the "Choose Graph" button and select "youGraph.graphml".
6. Press "Render Graph".

You can interact with the graph through touch by panning (to pan) or pinching (to zoom) in the white canvas shown in the control UI. 
To show the graph in the white canvas, press the "Show Graph (May take a while...)" button.
Note that if you use the "Show Graph (May take a while...)" functionality, other simultaneous instances of SigmaGraph may not work properly.