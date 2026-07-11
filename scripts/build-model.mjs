import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import fs from 'node:fs';

const DIR = 'assets-src/animations/Meshy_AI_Take_the_FACE_exactly_biped';
const P = (n) => `${DIR}/Meshy_AI_Take_the_FACE_exactly_biped_Animation_${n}_withSkin.glb`;

const clips = {
  Arise: P('Arise'),
  Idle: P('Idle_03'),
  Walking: P('Walking'),
  Running: P('Running'),
  Wave: P('Wave_One_Hand'),
  BigWave: P('Big_Wave_Hello'),
  Backflip: P('Backflip'),
  JazzHands: P('Jazz_Hands_inplace'),
};

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});

fs.mkdirSync('public/models/clips', { recursive: true });
for (const [name, path] of Object.entries(clips)) {
  const doc = await io.read(path);
  const root = doc.getRoot();
  for (const node of root.listNodes()) {
    if (node.getMesh()) node.setMesh(null);
    if (node.getSkin()) node.setSkin(null);
  }
  for (const skin of root.listSkins()) skin.dispose();
  for (const anim of root.listAnimations()) anim.setName(name);
  await doc.transform(dedup(), prune());
  const out = `public/models/clips/${name.toLowerCase()}.glb`;
  await io.write(out, doc);
  console.log(name, '→', out, (fs.statSync(out).size / 1024).toFixed(0) + 'KB');
}
console.log('done');
