"use client";
import React, { useRef, useEffect } from 'react';

// Хук для инициализации WebGL
const useShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);

  class WebGLRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram | null = null;
    private vs: WebGLShader | null = null;
    private fs: WebGLShader | null = null;
    private buffer: WebGLBuffer | null = null;
    private scale: number;
    private shaderSource: string;

    private vertexSrc = `#version 300 es
      precision highp float;
      in vec4 position;
      void main(){gl_Position=position;}
    `;

    private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

    constructor(canvas: HTMLCanvasElement, scale: number) {
      this.canvas = canvas;
      this.scale = scale;
      this.gl = canvas.getContext('webgl2')!;
      this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
      this.shaderSource = authShaderSource;
    }

    updateScale(scale: number) {
      this.scale = scale;
      this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
    }

    compile(shader: WebGLShader, source: string) {
      const gl = this.gl;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
      }
    }

    reset() {
      const gl = this.gl;
      if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
        if (this.vs) { gl.detachShader(this.program, this.vs); gl.deleteShader(this.vs); }
        if (this.fs) { gl.detachShader(this.program, this.fs); gl.deleteShader(this.fs); }
        gl.deleteProgram(this.program);
      }
    }

    setup() {
      const gl = this.gl;
      this.vs = gl.createShader(gl.VERTEX_SHADER)!;
      this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
      this.compile(this.vs, this.vertexSrc);
      this.compile(this.fs, this.shaderSource);
      this.program = gl.createProgram()!;
      gl.attachShader(this.program, this.vs);
      gl.attachShader(this.program, this.fs);
      gl.linkProgram(this.program);
    }

    init() {
      const gl = this.gl;
      const program = this.program!;
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      (program as any).resolution = gl.getUniformLocation(program, 'resolution');
      (program as any).time = gl.getUniformLocation(program, 'time');
    }

    render(now = 0) {
      const gl = this.gl;
      const program = this.program;
      if (!program) return;

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.uniform2f((program as any).resolution, this.canvas.width, this.canvas.height);
      gl.uniform1f((program as any).time, now * 1e-3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  const resize = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    if (rendererRef.current) rendererRef.current.updateScale(dpr);
  };

  const loop = (now: number) => {
    if (!rendererRef.current) return;
    rendererRef.current.render(now);
    animationFrameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    
    rendererRef.current = new WebGLRenderer(canvas, dpr);
    rendererRef.current.setup();
    rendererRef.current.init();
    resize();
    loop(0);
    window.addEventListener('resize', resize);
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) rendererRef.current.reset();
    };
  }, []);

  return canvasRef;
};

// --- ПОЛНОСТЬЮ ЗЕЛЕНЫЙ ШЕЙДЕР ---
const authShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}

float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float a=rnd(i), b=rnd(i+vec2(1,0)), c=rnd(i+vec2(0,1)), d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}

float invisibleDistortion(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}

float getStarLayer(vec2 uv, float scale, float speed, float threshold) {
  vec2 p = uv + vec2(time * speed, 0.0);
  vec2 grid = floor(p * scale);
  vec2 local = fract(p * scale) - 0.5;
  
  float n = rnd(grid);
  
  if (n < threshold) return 0.0;
  
  vec2 offset = vec2(rnd(grid * 1.1), rnd(grid * 8.4)) - 0.5;
  float d = length(local - offset * 0.4);
  
  float brightness = 0.005 / d;
  brightness = pow(brightness, 1.5);
  
  brightness *= (n - threshold) * 20.0;
  brightness *= (0.8 + 0.2 * sin(time * 3.0 + n * 10.0));
  
  return brightness;
}

void main(void) {
  vec2 uv=(FC-.5*R)/MN; 
  vec2 starUV = (FC - 0.5 * R) / R.y;

  vec3 col=vec3(0);
  
  // 1. ЗВЕЗДЫ
  float stars1 = getStarLayer(starUV, 25.0, 0.02, 0.90);
  float stars2 = getStarLayer(starUV, 12.0, 0.05, 0.92);
  vec3 bgSpace = vec3(stars1 + stars2) * 1.5; 
  
  
  // 2. КОМЕТЫ И ШЛЕЙФ
  float distortion = invisibleDistortion(vec2(uv.x*2.0+T*.2, -uv.y)); 
  uv*=1.3-.2*(sin(T*.1)*.5+.5); 
  
  for (float i=1.; i<12.; i++) {
    uv+=.4*cos(i*vec2(.1+.01*i, .8)+i*i+T*.2+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    
    // Цвет ЯДРА кометы (Ярко-зеленый с белым центром)
    col+=.0015/d * (cos(sin(i)*vec3(0.2, 2.0, 1.0)) + vec3(0.1, 0.9, 0.3));
    
    // Расчет шлейфа (дыма)
    float b=noise(i+p+distortion*1.731);
    float tailIntensity = .002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    
    // ЦВЕТ ШЛЕЙФА (Окрашиваем дым в зеленый градиент)
    // R=0.1, G=0.8, B=0.4 (Изумрудно-зеленый)
    col += tailIntensity * vec3(0.1, 0.8, 0.4); 
    
    col=mix(col, vec3(0.0), d);
  }

  O=vec4(col + bgSpace, 1);
}`;

export const AuthBackground = () => {
  const canvasRef = useShaderBackground();

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover touch-none pointer-events-none opacity-80"
      style={{ background: '#000000' }}
    />
  );
};