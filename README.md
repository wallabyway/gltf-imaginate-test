# gltf-hurl-tpfmc-comp

https://wallabyway.github.io/gltf-imaginate-test/

Preview:
![video](https://user-images.githubusercontent.com/440241/133864513-6a135378-47a7-4f94-bbdc-5291e364ac52.mp4)


### How to Generate the GlTFs

Run the script `node filter-by-props.js` (found under `/generateGlTFs`).

This script does a few things...

1. it converts an SVF into glTF tiles.  ie. 'svfs/icestadium'
2. It breaks the SVF into glTFs, each a different Revit category.  Categories  like structural, piping, arch, etc) based on the [root-level hierachy](https://forge.autodesk.com/blog/get-all-dbid-without-enumerating-model-hierarchy) of the model's assembly (same thing that appears in the model browser).
3. 3 LOD's are generated.  far, middle, close.  far - removes the nuts & bolts in the glTFs based on their AABB volume, using the filter override method.  middle - includes some nuts & bolts.  close - includes everything.
4. finally, each glTF, is optimized using glTFPack.  It does mesh-consolidation based on material-shader, MeshOpt compression, Quantization and saves as a single .glb file.
5. It runs glTFPack in parallel, on multiple glTFs.  So the pipeline is incrediable fast.

One of the reasons to break up the glTF into smaller glTFs is due to stop forge-convert-utils crashing.  When it tries to stringify the glTF, if it's too large, it crashes.  So instead, make the glTF smaller with a filter - this avoids crashing.



 