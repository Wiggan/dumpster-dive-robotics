import bpy
from pathlib import Path
import os
import sys
import subprocess

owd = os.getcwd()
print(owd)

input_dir = Path('../models/')
output_dir = Path('../public/models/')
output_dir.mkdir(644, parents=True, exist_ok=True)
file_list = [f for f in input_dir.resolve().glob('**/*.blend') if f.is_file()]

for f in file_list:
    Path(output_dir / f.stem).mkdir(644, parents=True, exist_ok=True)
    output_obj_filename = (output_dir / f.stem / (f.stem + ".obj")).resolve()
    output_mtl_filename = (output_dir / f.stem / (f.stem + ".mtl")).resolve()
    print("Exporting " + str(f) + " to " + str(output_obj_filename))
    bpy.ops.wm.open_mainfile(filepath=str(f))
    bpy.ops.export_scene.obj(filepath=str(output_obj_filename), use_mesh_modifiers=True, group_by_material=True, use_triangles=True, use_blen_objects=True, use_normals=True)
    sys.argv = [sys.argv[0], output_obj_filename, output_mtl_filename]
    
    subprocess.call(['python', 'objparser.py', output_obj_filename, output_mtl_filename])

    os.remove(output_obj_filename)
    os.remove(output_mtl_filename)

