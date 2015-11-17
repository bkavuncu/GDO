#Distributed Graph Renderer

This distributed graph visualisation app is integrated with Gephi and supports visualisation of any graph built using Gephi. It automatically transforms graph based on GDO configuration, and it supports various interactive features such as panning, zooming and searching. Before we visualise it, we need to prepare the graphs in Gephi and transform the data using Node.js into suitable formats.

##Step one: Prepare graphs using Gephi
1. Install JSONExporter plugin in Gephi. More information regarding plugin installation can be found here: https://marketplace.gephi.org/plugin/json-exporter/
2. Visualise and transform graphs within Gephi. Once a desired state is achieved, export the graph into a .json file using the plugin.

##Step two: Transform Gephi JSON data using Node.js
1. On your machine, install Node.js and npm. Installation instructions can be found here: http://blog.npmjs.org/post/85484771375/how-to-install-npm
2. Install two packages - 'ngraph.graph' and ‘fs', using the follow commands:
- $ npm install ngraph.graph
- $ npm install fs
3. Place the JSON file generated from Gephi into the same directory where you store processGephi.js file.
4. Within the same directory, run the following command to generate data files for visualisation. Simply change the third argument, shown as ‘filename.json’ here to the name of your JSON file:
- $ node processGephi.js filename.json
- This command will generate 7 files: nodes.json, labels.json,  linksPos.bin, nodesPos.bin, linksDistribution.json, linksDistribution.csv, output.json
- The first 4 files are necessary to be included as input for .NET graph visualisation app, whereas the last 3 files are extra data extracted for further analysis.

##Step three: Visualise & interact
1. To visualise the graph, place the 4 files - nodes.json, labels.json, linksPos.bin, nodesPos.bin into a folder, and upload it to the directory that .NET app reads from.
2. Start the .NET app, input the folder name and click ‘Render Graph’.
3. Your beautiful graph will now be shown on the GDO.