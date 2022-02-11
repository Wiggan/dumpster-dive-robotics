'use strict';

var gl, 
    d2,
    projection_matrix = mat4.create(), 
    view_matrix = mat4.create(),
    picking = true;

class Renderer {
    constructor() {
        this.offscreenTextures = [];
        this.framebuffer;
        this.pingpongTextures = [];
        this.pingpongFramebuffers = [];
        this.drawables = [];
        this.lights = [];
        this.textboxes = [];

        // Retrieve the canvas
        const canvas = utils.getCanvas('game_canvas');
        const canvas_text = utils.getCanvas('text_canvas');

        // Set the canvas to the size of the screen
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas_text.width = window.innerWidth;
        canvas_text.height = window.innerHeight;

        // Retrieve a WebGL context
        gl = utils.getGLContext(canvas);
        d2 = canvas_text.getContext('2d');

        // Set the clear color to be black
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);

        this.setup_textures();
        this.configureGeometry();
    }

    create_texture() {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        return texture;
    }

    create_id_texture() {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32UI, gl.canvas.width, gl.canvas.height, 0, gl.RED_INTEGER, gl.UNSIGNED_INT, null);
        return texture;
    }

    setup_textures() {
        // Textures
        this.offscreenTextures.push(this.create_texture());
        this.offscreenTextures.push(this.create_texture());
        this.offscreenTextures.push(this.create_id_texture());
        //this.msaaTexture = this.create_texture();

        // Render buffer
        this.renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.width, gl.canvas.height);
        //gl.renderbufferStorageMultisample(gl.RENDERBUFFER, gl.getParameter(gl.MAX_SAMPLES), gl.RBGA8, gl.canvas.width, gl.canvas.height);


        // Frame buffer
        this.framebuffer = gl.createFramebuffer();
        //this.blit_framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        for (var i = 0; i < 3; i++) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl['COLOR_ATTACHMENT' + i], gl.TEXTURE_2D, this.offscreenTextures[i], 0);
        }
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2]);

        //gl.bindFramebuffer(gl.FRAMEBUFFER, this.blit_framebuffer);
        //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.msaaTexture, 0);
        

        // Textures for ping pong
        for (var i = 0; i < 2; i++) {
            this.pingpongFramebuffers.push(gl.createFramebuffer());
            this.pingpongTextures.push(this.create_texture());
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.pingpongFramebuffers[i]);
            gl.bindTexture(gl.TEXTURE_2D, this.pingpongTextures[i]);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.pingpongTextures[i], 0);
        }
        
        // Clean up
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    add_drawable(model, material, world_transform, id) {
        this.drawables.push({
            model: model,
            material: material,
            world_transform: world_transform,
            id: id
        });
    }

    add_light(light) {
        this.lights.push(light);
    }

    savePixelUnderCursor() {
        const rect = gl.canvas.getBoundingClientRect();
        var x = active_camera.x - rect.left;
        var y = rect.height - (active_camera.y - rect.top);
        var data = new Uint32Array(1);
        gl.readBuffer(gl.COLOR_ATTACHMENT2);
        gl.readPixels(x, y, 1, 1, gl.RED_INTEGER, gl.UNSIGNED_INT, data);
        //console.log("Pixel x: " + x + ", y: " + y + " has color " + data);
        //console.log("Pixel has color " + data);
        selected_id = Number(data);
    }
    
    render() {
        this.validateSize();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        this.draw();
        if (picking) {
            this.savePixelUnderCursor();
        }

        // Offscreen MSAA 
        /* gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.framebuffer);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.blit_framebuffer);
        gl.clearBufferfv(gl.COLOR, 0, [1.0, 1.0, 1.0, 1.0]);
        
        gl.blitFramebuffer(0, 0, gl.canvas.width, gl.canvas.height,
                           0, 0, gl.canvas.width, gl.canvas.height,
                           gl.COLOR_BUFFER_BIT, gl.LINEAR);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.blit_framebuffer); */


        // Perform blur
        var horizontal = true, first_iteration = true;
        var amount = 10;
        gl.useProgram(gaussian_blur_program);
        for (var i = 0; i < amount; i++) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.pingpongFramebuffers[horizontal ? 1 : 0]); 
            gl.uniform1i(gaussian_blur_program.horizontal, horizontal);

            gl.activeTexture(gl.TEXTURE0);
            var tex = first_iteration == true ? this.offscreenTextures[1] : this.pingpongTextures[!horizontal ? 1 : 0];
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.uniform1i(gaussian_blur_program.image, 0);
            
            this.render_quad(gaussian_blur_program);
            horizontal = !horizontal;
            if (first_iteration) first_iteration = false;
        }


        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.draw_post_process();

        // UI
        this.add_textbox({text: "FPS: " + fps, screen_pos: [200, 100]});
        this.draw_textboxes();
    }


    validateSize() {
        // 1. Resize Color Texture
        for (var i = 0; i < 2; i++) {
            gl.bindTexture(gl.TEXTURE_2D, this.offscreenTextures[i]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
        for (var i = 0; i < 2; i++) {
            gl.bindTexture(gl.TEXTURE_2D, this.pingpongTextures[i]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

        // 2. Resize Render Buffer
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.width, gl.canvas.height);

        // 3. Clean up
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }

    render_quad(p) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // Bind the quad geometry
        gl.enableVertexAttribArray(p.aVertexPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(p.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(p.aVertexTextureCoords);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.vertexAttribPointer(p.aVertexTextureCoords, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Cleanup
        gl.activeTexture(gl.TEXTURE0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    draw_post_process() {
        // Use the Post Process shader
        gl.useProgram(ppProgram);
        
        // Bind the textures from the framebuffer
        //for (var i = 0; i < 2; i++) {
        //    gl.activeTexture(gl['TEXTURE' + i]);
        //    gl.bindTexture(gl.TEXTURE_2D, this.offscreenTextures[i]);
        //    gl.uniform1i(ppProgram['uSampler' + i], i);
        //}
        gl.activeTexture(gl['TEXTURE' + 0]);
        gl.bindTexture(gl.TEXTURE_2D, this.offscreenTextures[0]);
        gl.uniform1i(ppProgram['uSampler' + 0], 0);
        gl.activeTexture(gl['TEXTURE' + 1]);
        gl.bindTexture(gl.TEXTURE_2D, this.pingpongTextures[1]);
        gl.uniform1i(ppProgram['uSampler' + 1], 1);
        
        this.render_quad(ppProgram);
    }

    configureGeometry() {
        // Define the geometry for the full-screen quad
        const vertices = [
          -1, -1,
          1, -1,
          -1, 1,
          -1, 1,
          1, -1,
          1, 1
        ];
    
        const textureCoords = [
          0, 0,
          1, 0,
          0, 1,
          0, 1,
          1, 0,
          1, 1
        ];
    
        // Init the buffers
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
        this.textureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    
        // Clean up
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    setMaterial(program, material) {
        gl.uniform3fv(program['uMaterial.diffuse'], material.diffuse);
        gl.uniform1i(program['uMaterial.isLight'], material.isLight);
        gl.uniform3fv(program['uMaterial.ambient'], material.ambient); 
        gl.uniform3fv(program['uMaterial.specular'], material.specular); 
        gl.uniform1f(program['uMaterial.shininess'], material.shininess);
    }

    draw() {
        gl.useProgram(program);
        // Clear the scene
        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
        gl.clearBufferfv(gl.COLOR, 1, [0.0, 0.0, 0.0, 0.0]);
        gl.clearBufferuiv(gl.COLOR, 2, [0, 0, 0, 0]);
        gl.clearBufferfi(gl.DEPTH_STENCIL, 0, 1.0, 0);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
        // We will discuss these operations in later chapters
        mat4.perspective(projection_matrix, 45, gl.canvas.width / gl.canvas.height, 1, 10000);
    
        //const lightPositions = this.lights.map((light) => {return light.getPosition()}).flat();
        for (var i = 0; i < 4 && i < this.lights.length; i++) {
            gl.uniform3fv(program['uLight[' + i + '].position'], this.lights[i].getPosition());
            gl.uniform3fv(program['uLight[' + i + '].ambient'], this.lights[i].ambient);
            gl.uniform3fv(program['uLight[' + i + '].diffuse'], this.lights[i].diffuse);
            gl.uniform3fv(program['uLight[' + i + '].specular'], this.lights[i].specular);
            gl.uniform1f(program['uLight[' + i + '].constant'], this.lights[i].constant);
            gl.uniform1f(program['uLight[' + i + '].linear'], this.lights[i].linear);
            gl.uniform1f(program['uLight[' + i + '].quadratic'], this.lights[i].quadratic);
        }
        gl.uniform1i(program.uNumLights, Math.min(4, this.lights.length));

        gl.uniform3fv(program.uCameraPos, active_camera.getPosition()); 
        gl.uniformMatrix4fv(program.uProjectionMatrix, false, projection_matrix);
        view_matrix = active_camera.getViewMatrix();
        gl.uniformMatrix4fv(program.uViewMatrix, false, view_matrix);
        this.drawables.forEach((drawable) => {
            gl.uniformMatrix4fv(program.uModelMatrix, false, drawable.world_transform);
            //gl.uniform4fv(program.uIdColor, [0, 1, 2, 3]);
            gl.uniform1ui(program.uIdColor, drawable.id);
            gl.uniform1ui(program.uSelected, drawable.id == selected_id);
            var modelViewMatrix = mat4.create();
            mat4.copy(modelViewMatrix, view_matrix);
            mat4.multiply(modelViewMatrix, modelViewMatrix, drawable.world_transform);
    
            var normalMatrix = mat4.create();
            mat4.copy(normalMatrix, modelViewMatrix);
            mat4.invert(normalMatrix, normalMatrix);
            mat4.transpose(normalMatrix, normalMatrix);
    
            gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);
            gl.uniformMatrix4fv(program.uNormalMatrix, false, normalMatrix);
            
            this.setMaterial(program, drawable.material);


        
            // Use the buffers we've constructed
            gl.bindVertexArray(drawable.model.vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, drawable.model.indexBuffer);
    
            // Draw to the scene using triangle primitives
            gl.drawElements(gl.TRIANGLES, drawable.model.indices.length, gl.UNSIGNED_SHORT, 0);

            // Clean
            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        });
        this.drawables.length = 0;
        this.lights.length = 0;
    }

    add_textbox(textbox) {
        this.textboxes.push(textbox);
    }

    draw_textboxes() {
        d2.clearRect(0, 0, d2.canvas.clientWidth, d2.canvas.clientHeight); 
        d2.fillStyle = 'rgba(' + game.overlay[0]*255 + ',' + game.overlay[1]*255 + ',' +  game.overlay[2]*255 + ',' +  game.overlay[3] +')';
        d2.fillRect(0, 0, d2.canvas.clientWidth, d2.canvas.clientHeight); 
        this.textboxes.forEach(textbox => {
            var pos;
            if (textbox.screen_pos != undefined) {
                pos = textbox.screen_pos;
            } else {
                pos = getWorldLocationScreenSpace(textbox.pos);
            }
            d2.save();
            d2.font = "10px Courier New";
            d2.globalAlpha = 0.4;
            d2.fillStyle = "gold";
            var text_measure = d2.measureText(textbox.text);
            d2.translate(pos[0] - text_measure.width/2, pos[1]-25);
            d2.fillRect(0, 0, text_measure.width, 14);

            if (textbox.health != undefined) {
                d2.fillStyle = "red";
                d2.fillRect(text_measure.width * textbox.health, 0, text_measure.width - text_measure.width * textbox.health, 14);
            }
            
            d2.globalAlpha = 0.8;
            d2.fillStyle = "white";
            d2.fillText(textbox.text, 0, 9);
            d2.restore();
        });
        this.textboxes.length = 0;
    }
}
