/*
 * Example: converting an SVF (without property database) from local file system.
 * Usage:
 *     node filter-by-props.js <path to svf file> <path to output folder>
 */

const path = require('path');
const { SvfReader, GltfWriter } = require('forge-convert-utils');
const { spawn } = require("child_process");

const json = require('./HURL_TPFMC_COMP.properties.json');

function getLeaves(root) {
    leaves=[];
  function dig(currentNode) {
    for(var index in currentNode.objects) {
      var node = currentNode.objects[index];
      if(node.objectid)
          leaves.push(node.objectid);
      dig(node);
    }
  }
  dig(root);
  return leaves;
}

async function generateGltf(scene, dbids, outputDir, filename, xtile, ytile, numTiles) {
    const defaultOptions = {
        deduplicate: false,
        skipUnusedUvs: true,
        center: true,
        log: console.log,
        filter: (frag, mat, min, max) => {
            if (mat.opacity < 1.0) 
                return false; // skip transparent objects
            const width = (max[0]-min[0])/numTiles;
            const height = (max[1]-min[1])/numTiles;
            if ((frag.transform.t.x < (min[0] + width * xtile)) ||
                (frag.transform.t.x > (min[0] + width * (xtile+1))))
                return;
            if ((frag.transform.t.y < (min[1] + width * ytile)) ||
                (frag.transform.t.y > (min[1] + width * (ytile+1))))
                return;
            //if ((Math.abs(frag.bbox[0]-frag.bbox[3])+Math.abs(frag.bbox[1]-frag.bbox[4])+Math.abs(frag.bbox[2]-frag.bbox[5])) < 1.5)
                //return false; //skip small volume AABBs.
            return ((dbids.indexOf(frag.dbID))>0) } // here is the filter
    };

    try {
        writer = new GltfWriter(Object.assign({}, defaultOptions));
        await writer.write(scene, `${outputDir}/${filename}`);
        const ls = spawn("gltfpack", ["-mi", "-i",`${outputDir}/${filename}/output.gltf`, "-o",`${outputDir}/${filename}.glb`]);
        ls.stdout.on("data", data => {
            console.log(`stdout: ${data}`);
        });
    } catch(err) {
        console.error(err);
        process.exit(1);
    }

} 

class PropsGltfWriter extends GltfWriter {
    /**
     * Initializes the writer.
     * @param {IWriterOptions} [options={}] Additional writer options.
     * @param {number[]} min Minimum x/y/z values of the filtered area.
     * @param {number[]} max Maximum x/y/z values of the filtered area.
     */
    constructor(options, min, max) {
        super(options);
        this._min = min;
        this._max = max;
    }

    createNode(fragment /* IMF.IObjectNode */, imf /* IMF.IScene */, outputUvs /* boolean */) {
        return super.createNode(fragment, imf, outputUvs);
    }
}

async function run (infilepath, outputDir) {

    const PX_B1006A = json.data.objects[0].objects[3].objects;
    const all_Not_PX_B1006A = json.data.objects[0].objects;
    //all_Not_PX_B1006A.splice(3,1);

    const reader = await SvfReader.FromFileSystem(infilepath);
    const scene = await reader.read();

/*
    for (const subJson of PX_B1006A) {
        const dbids = getLeaves(subJson);
        const name = subJson.name.replace(/\//g, '_');
        console.log(`${outputDir}/PX_B1006A_/${name}: ${dbids.length}`)
        await generateGltf(scene, dbids, `${outputDir}/PX_B1006A_`, name);
    };
*/
    for (const subJson of all_Not_PX_B1006A) {
        const dbids = getLeaves(subJson);
        const name = subJson.name.replace(/\//g, '_');
        console.log(`${outputDir}/${name}: ${dbids.length}`)
        await generateGltf(scene, dbids, outputDir, name, 1,0,2);
    };
}

run(process.argv[2], process.argv[3]);



