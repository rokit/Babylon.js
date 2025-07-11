/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from "../Misc/logger";
import type { Nullable, FloatArray, IndicesArray } from "../types";
import { Engine } from "../Engines/engine";
import type { RenderTargetCreationOptions } from "../Materials/Textures/textureCreationOptions";
import type { VertexBuffer } from "../Buffers/buffer";
import { InternalTexture, InternalTextureSource } from "../Materials/Textures/internalTexture";
import type { Effect } from "../Materials/effect";
import { Constants } from "./constants";
import type { IPipelineContext } from "./IPipelineContext";
import { DataBuffer } from "../Buffers/dataBuffer";
import type { IColor4Like, IViewportLike } from "../Maths/math.like";
import type { ISceneLike } from "./abstractEngine";
import { PerformanceConfigurator } from "./performanceConfigurator";
import type { DrawWrapper } from "../Materials/drawWrapper";
import { RenderTargetWrapper } from "./renderTargetWrapper";
import type { IStencilState } from "../States/IStencilState";
import { IsWrapper } from "../Materials/drawWrapper.functions";

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const global: any;

/**
 * Options to create the null engine
 */
export class NullEngineOptions {
    /**
     * Render width (Default: 512)
     */
    public renderWidth = 512;
    /**
     * Render height (Default: 256)
     */
    public renderHeight = 256;

    /**
     * Texture size (Default: 512)
     */
    public textureSize = 512;

    /**
     * If delta time between frames should be constant
     * @see https://doc.babylonjs.com/features/featuresDeepDive/animation/advanced_animations#deterministic-lockstep
     */
    public deterministicLockstep = false;

    /** Defines the seconds between each deterministic lock step */
    timeStep?: number;

    /**
     * Maximum about of steps between frames (Default: 4)
     * @see https://doc.babylonjs.com/features/featuresDeepDive/animation/advanced_animations#deterministic-lockstep
     */
    public lockstepMaxSteps = 4;

    /**
     * Make the matrix computations to be performed in 64 bits instead of 32 bits. False by default
     */
    useHighPrecisionMatrix?: boolean;

    /**
     * If supplied, the HTMLCanvasElement to use (e.g. as the inputElement)
     */
    renderingCanvas?: HTMLCanvasElement;
}

/**
 * The null engine class provides support for headless version of babylon.js.
 * This can be used in server side scenario or for testing purposes
 */
export class NullEngine extends Engine {
    private _options: NullEngineOptions;

    /**
     * Gets a boolean indicating that the engine is running in deterministic lock step mode
     * @see https://doc.babylonjs.com/features/featuresDeepDive/animation/advanced_animations#deterministic-lockstep
     * @returns true if engine is in deterministic lock step mode
     */
    public override isDeterministicLockStep(): boolean {
        return this._options.deterministicLockstep;
    }

    /**
     * Gets the max steps when engine is running in deterministic lock step
     * @see https://doc.babylonjs.com/features/featuresDeepDive/animation/advanced_animations#deterministic-lockstep
     * @returns the max steps
     */
    public override getLockstepMaxSteps(): number {
        return this._options.lockstepMaxSteps;
    }

    /**
     * Gets the current hardware scaling level.
     * By default the hardware scaling level is computed from the window device ratio.
     * if level = 1 then the engine will render at the exact resolution of the canvas. If level = 0.5 then the engine will render at twice the size of the canvas.
     * @returns a number indicating the current hardware scaling level
     */
    public override getHardwareScalingLevel(): number {
        return 1.0;
    }

    public constructor(options: NullEngineOptions = new NullEngineOptions()) {
        super(null);

        if (options.deterministicLockstep === undefined) {
            options.deterministicLockstep = false;
        }

        if (options.timeStep !== undefined) {
            this._timeStep = options.timeStep;
        }

        if (options.lockstepMaxSteps === undefined) {
            options.lockstepMaxSteps = 4;
        }

        this._options = options;

        PerformanceConfigurator.SetMatrixPrecision(!!options.useHighPrecisionMatrix);

        // Init caps
        // We consider we are on a webgl1 capable device

        this._caps = {
            maxTexturesImageUnits: 16,
            maxVertexTextureImageUnits: 16,
            maxCombinedTexturesImageUnits: 32,
            maxTextureSize: 512,
            maxCubemapTextureSize: 512,
            maxDrawBuffers: 0,
            maxRenderTextureSize: 512,
            maxVertexAttribs: 16,
            maxVaryingVectors: 16,
            maxFragmentUniformVectors: 16,
            maxVertexUniformVectors: 16,
            standardDerivatives: false,
            astc: null,
            pvrtc: null,
            etc1: null,
            etc2: null,
            bptc: null,
            maxAnisotropy: 0,
            uintIndices: false,
            fragmentDepthSupported: false,
            highPrecisionShaderSupported: true,
            colorBufferFloat: false,
            supportFloatTexturesResolve: false,
            rg11b10ufColorRenderable: false,
            textureFloat: false,
            textureFloatLinearFiltering: false,
            textureFloatRender: false,
            textureHalfFloat: false,
            textureHalfFloatLinearFiltering: false,
            textureHalfFloatRender: false,
            textureLOD: false,
            texelFetch: false,
            drawBuffersExtension: false,
            depthTextureExtension: false,
            vertexArrayObject: false,
            instancedArrays: false,
            supportOcclusionQuery: false,
            canUseTimestampForTimerQuery: false,
            maxMSAASamples: 1,
            blendMinMax: false,
            canUseGLInstanceID: false,
            canUseGLVertexID: false,
            supportComputeShaders: false,
            supportSRGBBuffers: false,
            supportTransformFeedbacks: false,
            textureMaxLevel: false,
            texture2DArrayMaxLayerCount: 128,
            disableMorphTargetTexture: false,
            textureNorm16: false,
            blendParametersPerTarget: false,
            dualSourceBlending: false,
        };

        this._features = {
            forceBitmapOverHTMLImageElement: false,
            supportRenderAndCopyToLodForFloatTextures: false,
            supportDepthStencilTexture: false,
            supportShadowSamplers: false,
            uniformBufferHardCheckMatrix: false,
            allowTexturePrefiltering: false,
            trackUbosInFrame: false,
            checkUbosContentBeforeUpload: false,
            supportCSM: false,
            basisNeedsPOT: false,
            support3DTextures: false,
            needTypeSuffixInShaderConstants: false,
            supportMSAA: false,
            supportSSAO2: false,
            supportIBLShadows: false,
            supportExtendedTextureFormats: false,
            supportSwitchCaseInShader: false,
            supportSyncTextureRead: false,
            needsInvertingBitmap: false,
            useUBOBindingCache: false,
            needShaderCodeInlining: false,
            needToAlwaysBindUniformBuffers: false,
            supportRenderPasses: true,
            supportSpriteInstancing: false,
            forceVertexBufferStrideAndOffsetMultiple4Bytes: false,
            _checkNonFloatVertexBuffersDontRecreatePipelineContext: false,
            _collectUbosUpdatedInFrame: false,
        };

        if (options.renderingCanvas) {
            this._renderingCanvas = options.renderingCanvas;
        }

        Logger.Log(`Babylon.js v${Engine.Version} - Null engine`);

        // Wrappers
        const theCurrentGlobal = typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : window;
        if (typeof URL === "undefined") {
            theCurrentGlobal.URL = {
                createObjectURL: function () {},
                revokeObjectURL: function () {},
            };
        }
        if (typeof Blob === "undefined") {
            theCurrentGlobal.Blob = function () {};
        }
    }

    /**
     * Creates a vertex buffer
     * @param vertices the data for the vertex buffer
     * @returns the new WebGL static buffer
     */
    public override createVertexBuffer(vertices: FloatArray): DataBuffer {
        const buffer = new DataBuffer();
        buffer.references = 1;
        return buffer;
    }

    /**
     * Creates a new index buffer
     * @param indices defines the content of the index buffer
     * @returns a new webGL buffer
     */
    public override createIndexBuffer(indices: IndicesArray): DataBuffer {
        const buffer = new DataBuffer();
        buffer.references = 1;
        return buffer;
    }

    /**
     * Clear the current render buffer or the current render target (if any is set up)
     * @param color defines the color to use
     * @param backBuffer defines if the back buffer must be cleared
     * @param depth defines if the depth buffer must be cleared
     * @param stencil defines if the stencil buffer must be cleared
     */
    public override clear(color: IColor4Like, backBuffer: boolean, depth: boolean, stencil: boolean = false): void {}

    /**
     * Gets the current render width
     * @param useScreen defines if screen size must be used (or the current render target if any)
     * @returns a number defining the current render width
     */
    public override getRenderWidth(useScreen = false): number {
        if (!useScreen && this._currentRenderTarget) {
            return this._currentRenderTarget.width;
        }

        return this._options.renderWidth;
    }

    /**
     * Gets the current render height
     * @param useScreen defines if screen size must be used (or the current render target if any)
     * @returns a number defining the current render height
     */
    public override getRenderHeight(useScreen = false): number {
        if (!useScreen && this._currentRenderTarget) {
            return this._currentRenderTarget.height;
        }

        return this._options.renderHeight;
    }

    /**
     * Set the WebGL's viewport
     * @param viewport defines the viewport element to be used
     * @param requiredWidth defines the width required for rendering. If not provided the rendering canvas' width is used
     * @param requiredHeight defines the height required for rendering. If not provided the rendering canvas' height is used
     */
    public override setViewport(viewport: IViewportLike, requiredWidth?: number, requiredHeight?: number): void {
        this._cachedViewport = viewport;
    }

    public override createShaderProgram(
        pipelineContext: IPipelineContext,
        vertexCode: string,
        fragmentCode: string,
        defines: string,
        context?: WebGLRenderingContext
    ): WebGLProgram {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __SPECTOR_rebuildProgram: null,
        };
    }

    /**
     * Gets the list of webGL uniform locations associated with a specific program based on a list of uniform names
     * @param pipelineContext defines the pipeline context to use
     * @param uniformsNames defines the list of uniform names
     * @returns an array of webGL uniform locations
     */
    public override getUniforms(pipelineContext: IPipelineContext, uniformsNames: string[]): Nullable<WebGLUniformLocation>[] {
        return [];
    }

    /**
     * Gets the lsit of active attributes for a given webGL program
     * @param pipelineContext defines the pipeline context to use
     * @param attributesNames defines the list of attribute names to get
     * @returns an array of indices indicating the offset of each attribute
     */
    public override getAttributes(pipelineContext: IPipelineContext, attributesNames: string[]): number[] {
        return [];
    }

    /**
     * Binds an effect to the webGL context
     * @param effect defines the effect to bind
     */
    public override bindSamplers(effect: Effect): void {
        this._currentEffect = null;
    }

    /**
     * Activates an effect, making it the current one (ie. the one used for rendering)
     * @param effect defines the effect to activate
     */
    public override enableEffect(effect: Nullable<Effect | DrawWrapper>): void {
        effect = effect !== null && IsWrapper(effect) ? effect.effect : effect; // get only the effect, we don't need a Wrapper in the WebGL engine

        this._currentEffect = effect as Nullable<Effect>;
        if (!effect) {
            return;
        }

        if (effect.onBind) {
            effect.onBind(effect);
        }
        if (effect._onBindObservable) {
            effect._onBindObservable.notifyObservers(effect);
        }
    }

    public override setStateCullFaceType(cullBackFaces?: boolean, force?: boolean): void {}

    /**
     * Set various states to the webGL context
     * @param culling defines culling state: true to enable culling, false to disable it
     * @param zOffset defines the value to apply to zOffset (0 by default)
     * @param force defines if states must be applied even if cache is up to date
     * @param reverseSide defines if culling must be reversed (CCW if false, CW if true)
     * @param cullBackFaces true to cull back faces, false to cull front faces (if culling is enabled)
     * @param stencil stencil states to set
     * @param zOffsetUnits defines the value to apply to zOffsetUnits (0 by default)
     */
    public override setState(
        culling: boolean,
        zOffset: number = 0,
        force?: boolean,
        reverseSide = false,
        cullBackFaces?: boolean,
        stencil?: IStencilState,
        zOffsetUnits: number = 0
    ): void {}

    /**
     * Set the value of an uniform to an array of int32
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of int32 to store
     * @returns true if value was set
     */
    public override setIntArray(uniform: WebGLUniformLocation, array: Int32Array): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to an array of int32 (stored as vec2)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of int32 to store
     * @returns true if value was set
     */
    public override setIntArray2(uniform: WebGLUniformLocation, array: Int32Array): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to an array of int32 (stored as vec3)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of int32 to store
     * @returns true if value was set
     */
    public override setIntArray3(uniform: WebGLUniformLocation, array: Int32Array): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to an array of int32 (stored as vec4)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of int32 to store
     * @returns true if value was set
     */
    public override setIntArray4(uniform: WebGLUniformLocation, array: Int32Array): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to an array of float32
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of float32 to store
     * @returns true if value was set
     */
    public setFloatArray(uniform: WebGLUniformLocation, array: Float32Array): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to an array of float32 (stored as vec2)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of float32 to store
     * @returns true if value was set
     */
    public setFloatArray2(uniform: WebGLUniformLocation, array: Float32Array): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to an array of float32 (stored as vec3)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of float32 to store
     * @returns true if value was set
     */
    public setFloatArray3(uniform: WebGLUniformLocation, array: Float32Array): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to an array of float32 (stored as vec4)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of float32 to store
     * @returns true if value was set
     */
    public setFloatArray4(uniform: WebGLUniformLocation, array: Float32Array): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to an array of number
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of number to store
     * @returns true if value was set
     */
    public override setArray(uniform: WebGLUniformLocation, array: number[]): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to an array of number (stored as vec2)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of number to store
     * @returns true if value was set
     */
    public override setArray2(uniform: WebGLUniformLocation, array: number[]): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to an array of number (stored as vec3)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of number to store
     * @returns true if value was set
     */
    public override setArray3(uniform: WebGLUniformLocation, array: number[]): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to an array of number (stored as vec4)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of number to store
     * @returns true if value was set
     */
    public override setArray4(uniform: WebGLUniformLocation, array: number[]): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to an array of float32 (stored as matrices)
     * @param uniform defines the webGL uniform location where to store the value
     * @param matrices defines the array of float32 to store
     * @returns true if value was set
     */
    public override setMatrices(uniform: WebGLUniformLocation, matrices: Float32Array): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to a matrix (3x3)
     * @param uniform defines the webGL uniform location where to store the value
     * @param matrix defines the Float32Array representing the 3x3 matrix to store
     * @returns true if value was set
     */
    public override setMatrix3x3(uniform: WebGLUniformLocation, matrix: Float32Array): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to a matrix (2x2)
     * @param uniform defines the webGL uniform location where to store the value
     * @param matrix defines the Float32Array representing the 2x2 matrix to store
     * @returns true if value was set
     */
    public override setMatrix2x2(uniform: WebGLUniformLocation, matrix: Float32Array): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to a number (float)
     * @param uniform defines the webGL uniform location where to store the value
     * @param value defines the float number to store
     * @returns true if value was set
     */
    public override setFloat(uniform: WebGLUniformLocation, value: number): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to a vec2
     * @param uniform defines the webGL uniform location where to store the value
     * @param x defines the 1st component of the value
     * @param y defines the 2nd component of the value
     * @returns true if value was set
     */
    public override setFloat2(uniform: WebGLUniformLocation, x: number, y: number): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to a vec3
     * @param uniform defines the webGL uniform location where to store the value
     * @param x defines the 1st component of the value
     * @param y defines the 2nd component of the value
     * @param z defines the 3rd component of the value
     * @returns true if value was set
     */
    public override setFloat3(uniform: WebGLUniformLocation, x: number, y: number, z: number): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to a boolean
     * @param uniform defines the webGL uniform location where to store the value
     * @param bool defines the boolean to store
     * @returns true if value was set
     */
    public setBool(uniform: WebGLUniformLocation, bool: number): boolean {
        return true;
    }

    /**
     * Set the value of an uniform to a vec4
     * @param uniform defines the webGL uniform location where to store the value
     * @param x defines the 1st component of the value
     * @param y defines the 2nd component of the value
     * @param z defines the 3rd component of the value
     * @param w defines the 4th component of the value
     * @returns true if value was set
     */
    public override setFloat4(uniform: WebGLUniformLocation, x: number, y: number, z: number, w: number): boolean {
        return true;
    }

    /**
     * Sets the current alpha mode
     * @param mode defines the mode to use (one of the Engine.ALPHA_XXX)
     * @param noDepthWriteChange defines if depth writing state should remains unchanged (false by default)
     * @param targetIndex defines the index of the target to set the alpha mode for (default is 0)
     * @see https://doc.babylonjs.com/features/featuresDeepDive/materials/advanced/transparent_rendering
     */
    public override setAlphaMode(mode: number, noDepthWriteChange: boolean = false, targetIndex = 0): void {
        if (this._alphaMode[targetIndex] === mode) {
            return;
        }

        this.alphaState.setAlphaBlend(mode !== Constants.ALPHA_DISABLE, 0);

        if (!noDepthWriteChange) {
            this.setDepthWrite(mode === Constants.ALPHA_DISABLE);
        }
        this._alphaMode[targetIndex] = mode;
    }

    /**
     * Bind webGl buffers directly to the webGL context
     * @param vertexBuffers defines the vertex buffer to bind
     * @param indexBuffer defines the index buffer to bind
     * @param effect defines the effect associated with the vertex buffer
     */
    public override bindBuffers(vertexBuffers: { [key: string]: VertexBuffer }, indexBuffer: DataBuffer, effect: Effect): void {}

    /**
     * Force the entire cache to be cleared
     * You should not have to use this function unless your engine needs to share the webGL context with another engine
     * @param bruteForce defines a boolean to force clearing ALL caches (including stencil, detoh and alpha states)
     */
    public override wipeCaches(bruteForce?: boolean): void {
        if (this.preventCacheWipeBetweenFrames) {
            return;
        }
        this.resetTextureCache();
        this._currentEffect = null;

        if (bruteForce) {
            this._currentProgram = null;

            this._stencilStateComposer.reset();
            this.depthCullingState.reset();
            this.alphaState.reset();
        }

        this._cachedVertexBuffers = null;
        this._cachedIndexBuffer = null;
        this._cachedEffectForVertexBuffers = null;
    }

    /**
     * Send a draw order
     * @param useTriangles defines if triangles must be used to draw (else wireframe will be used)
     * @param indexStart defines the starting index
     * @param indexCount defines the number of index to draw
     * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
     */
    public override draw(useTriangles: boolean, indexStart: number, indexCount: number, instancesCount?: number): void {}

    /**
     * Draw a list of indexed primitives
     * @param fillMode defines the primitive to use
     * @param indexStart defines the starting index
     * @param indexCount defines the number of index to draw
     * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
     */
    public override drawElementsType(fillMode: number, indexStart: number, indexCount: number, instancesCount?: number): void {}

    /**
     * Draw a list of unindexed primitives
     * @param fillMode defines the primitive to use
     * @param verticesStart defines the index of first vertex to draw
     * @param verticesCount defines the count of vertices to draw
     * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
     */
    public override drawArraysType(fillMode: number, verticesStart: number, verticesCount: number, instancesCount?: number): void {}

    /** @internal */
    protected override _createTexture(): WebGLTexture {
        return {};
    }

    /**
     * @internal
     */
    public override _releaseTexture(texture: InternalTexture): void {}

    /**
     * Usually called from Texture.ts.
     * Passed information to create a WebGLTexture
     * @param urlArg defines a value which contains one of the following:
     * * A conventional http URL, e.g. 'http://...' or 'file://...'
     * * A base64 string of in-line texture data, e.g. 'data:image/jpg;base64,/...'
     * * An indicator that data being passed using the buffer parameter, e.g. 'data:mytexture.jpg'
     * @param noMipmap defines a boolean indicating that no mipmaps shall be generated.  Ignored for compressed textures.  They must be in the file
     * @param invertY when true, image is flipped when loaded.  You probably want true. Certain compressed textures may invert this if their default is inverted (eg. ktx)
     * @param scene needed for loading to the correct scene
     * @param samplingMode mode with should be used sample / access the texture (Default: Texture.TRILINEAR_SAMPLINGMODE)
     * @param onLoad optional callback to be called upon successful completion
     * @param onError optional callback to be called upon failure
     * @param buffer a source of a file previously fetched as either a base64 string, an ArrayBuffer (compressed or image format), HTMLImageElement (image format), or a Blob
     * @param fallback an internal argument in case the function must be called again, due to etc1 not having alpha capabilities
     * @param format internal format.  Default: RGB when extension is '.jpg' else RGBA.  Ignored for compressed textures
     * @param forcedExtension defines the extension to use to pick the right loader
     * @param mimeType defines an optional mime type
     * @returns a InternalTexture for assignment back into BABYLON.Texture
     */
    public override createTexture(
        urlArg: Nullable<string>,
        noMipmap: boolean,
        invertY: boolean,
        scene: Nullable<ISceneLike>,
        samplingMode: number = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE,
        onLoad: Nullable<(texture: InternalTexture) => void> = null,
        onError: Nullable<(message: string, exception: any) => void> = null,
        buffer: Nullable<string | ArrayBuffer | ArrayBufferView | HTMLImageElement | Blob | ImageBitmap> = null,
        fallback: Nullable<InternalTexture> = null,
        format: Nullable<number> = null,
        forcedExtension: Nullable<string> = null,
        mimeType?: string
    ): InternalTexture {
        const texture = new InternalTexture(this, InternalTextureSource.Url);
        const url = String(urlArg);

        texture.url = url;
        texture.generateMipMaps = !noMipmap;
        texture.samplingMode = samplingMode;
        texture.invertY = invertY;
        texture.baseWidth = this._options.textureSize;
        texture.baseHeight = this._options.textureSize;
        texture.width = this._options.textureSize;
        texture.height = this._options.textureSize;
        if (format) {
            texture.format = format;
        }

        texture.isReady = true;

        if (onLoad) {
            setTimeout(() => {
                onLoad(texture);
            });
        }

        this._internalTexturesCache.push(texture);

        return texture;
    }

    /**
     * @internal
     */
    public override _createHardwareRenderTargetWrapper(
        isMulti: boolean,
        isCube: boolean,
        size: number | { width: number; height: number; depth?: number; layers?: number }
    ): RenderTargetWrapper {
        const rtWrapper = new RenderTargetWrapper(isMulti, isCube, size, this);
        this._renderTargetWrapperCache.push(rtWrapper);
        return rtWrapper;
    }

    /**
     * Creates a new render target wrapper
     * @param size defines the size of the texture
     * @param options defines the options used to create the texture
     * @returns a new render target wrapper
     */
    public override createRenderTargetTexture(size: any, options: boolean | RenderTargetCreationOptions): RenderTargetWrapper {
        const rtWrapper = this._createHardwareRenderTargetWrapper(false, false, size);

        const fullOptions: RenderTargetCreationOptions = {};

        if (options !== undefined && typeof options === "object") {
            fullOptions.generateMipMaps = options.generateMipMaps;
            fullOptions.generateDepthBuffer = options.generateDepthBuffer === undefined ? true : options.generateDepthBuffer;
            fullOptions.generateStencilBuffer = fullOptions.generateDepthBuffer && options.generateStencilBuffer;
            fullOptions.type = options.type === undefined ? Constants.TEXTURETYPE_UNSIGNED_BYTE : options.type;
            fullOptions.samplingMode = options.samplingMode === undefined ? Constants.TEXTURE_TRILINEAR_SAMPLINGMODE : options.samplingMode;
        } else {
            fullOptions.generateMipMaps = options;
            fullOptions.generateDepthBuffer = true;
            fullOptions.generateStencilBuffer = false;
            fullOptions.type = Constants.TEXTURETYPE_UNSIGNED_BYTE;
            fullOptions.samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE;
        }
        const texture = new InternalTexture(this, InternalTextureSource.RenderTarget);

        const width = size.width || size;
        const height = size.height || size;

        rtWrapper._generateDepthBuffer = fullOptions.generateDepthBuffer;
        rtWrapper._generateStencilBuffer = fullOptions.generateStencilBuffer ? true : false;

        texture.baseWidth = width;
        texture.baseHeight = height;
        texture.width = width;
        texture.height = height;
        texture.isReady = true;
        texture.samples = 1;
        texture.generateMipMaps = fullOptions.generateMipMaps ? true : false;
        texture.samplingMode = fullOptions.samplingMode;
        texture.type = fullOptions.type;

        this._internalTexturesCache.push(texture);

        return rtWrapper;
    }

    /**
     * Creates a new render target wrapper
     * @param size defines the size of the texture
     * @param options defines the options used to create the texture
     * @returns a new render target wrapper
     */
    public override createRenderTargetCubeTexture(size: number, options?: RenderTargetCreationOptions): RenderTargetWrapper {
        const rtWrapper = this._createHardwareRenderTargetWrapper(false, true, size);

        const fullOptions = {
            generateMipMaps: true,
            generateDepthBuffer: true,
            generateStencilBuffer: false,
            type: Constants.TEXTURETYPE_UNSIGNED_BYTE,
            samplingMode: Constants.TEXTURE_TRILINEAR_SAMPLINGMODE,
            format: Constants.TEXTUREFORMAT_RGBA,
            ...options,
        };
        fullOptions.generateStencilBuffer = fullOptions.generateDepthBuffer && fullOptions.generateStencilBuffer;

        if (fullOptions.type === Constants.TEXTURETYPE_FLOAT && !this._caps.textureFloatLinearFiltering) {
            // if floating point linear (gl.FLOAT) then force to NEAREST_SAMPLINGMODE
            fullOptions.samplingMode = Constants.TEXTURE_NEAREST_SAMPLINGMODE;
        } else if (fullOptions.type === Constants.TEXTURETYPE_HALF_FLOAT && !this._caps.textureHalfFloatLinearFiltering) {
            // if floating point linear (HALF_FLOAT) then force to NEAREST_SAMPLINGMODE
            fullOptions.samplingMode = Constants.TEXTURE_NEAREST_SAMPLINGMODE;
        }

        rtWrapper._generateDepthBuffer = fullOptions.generateDepthBuffer;
        rtWrapper._generateStencilBuffer = fullOptions.generateStencilBuffer ? true : false;

        const texture = new InternalTexture(this, InternalTextureSource.RenderTarget);
        texture.baseWidth = size;
        texture.baseHeight = size;
        texture.width = size;
        texture.height = size;
        texture.isReady = true;
        texture.isCube = true;
        texture.samples = 1;
        texture.generateMipMaps = fullOptions.generateMipMaps ? true : false;
        texture.samplingMode = fullOptions.samplingMode;
        texture.type = fullOptions.type;

        this._internalTexturesCache.push(texture);

        return rtWrapper;
    }

    /**
     * Update the sampling mode of a given texture
     * @param samplingMode defines the required sampling mode
     * @param texture defines the texture to update
     */
    public override updateTextureSamplingMode(samplingMode: number, texture: InternalTexture): void {
        texture.samplingMode = samplingMode;
    }

    /**
     * Creates a raw texture
     * @param data defines the data to store in the texture
     * @param width defines the width of the texture
     * @param height defines the height of the texture
     * @param format defines the format of the data
     * @param generateMipMaps defines if the engine should generate the mip levels
     * @param invertY defines if data must be stored with Y axis inverted
     * @param samplingMode defines the required sampling mode (Texture.NEAREST_SAMPLINGMODE by default)
     * @param compression defines the compression used (null by default)
     * @param type defines the type fo the data (Engine.TEXTURETYPE_UNSIGNED_BYTE by default)
     * @param creationFlags specific flags to use when creating the texture (Constants.TEXTURE_CREATIONFLAG_STORAGE for storage textures, for eg)
     * @param useSRGBBuffer defines if the texture must be loaded in a sRGB GPU buffer (if supported by the GPU).
     * @returns the raw texture inside an InternalTexture
     */
    public override createRawTexture(
        data: Nullable<ArrayBufferView>,
        width: number,
        height: number,
        format: number,
        generateMipMaps: boolean,
        invertY: boolean,
        samplingMode: number,
        compression: Nullable<string> = null,
        type: number = Constants.TEXTURETYPE_UNSIGNED_BYTE,
        creationFlags = 0,
        useSRGBBuffer = false
    ): InternalTexture {
        const texture = new InternalTexture(this, InternalTextureSource.Raw);
        texture.baseWidth = width;
        texture.baseHeight = height;
        texture.width = width;
        texture.height = height;
        texture.format = format;
        texture.generateMipMaps = generateMipMaps;
        texture.samplingMode = samplingMode;
        texture.invertY = invertY;
        texture._compression = compression;
        texture.type = type;
        texture._useSRGBBuffer = useSRGBBuffer;

        if (!this._doNotHandleContextLost) {
            texture._bufferView = data;
        }

        return texture;
    }

    /**
     * Update a raw texture
     * @param texture defines the texture to update
     * @param data defines the data to store in the texture
     * @param format defines the format of the data
     * @param invertY defines if data must be stored with Y axis inverted
     * @param compression defines the compression used (null by default)
     * @param type defines the type fo the data (Engine.TEXTURETYPE_UNSIGNED_BYTE by default)
     * @param useSRGBBuffer defines if the texture must be loaded in a sRGB GPU buffer (if supported by the GPU).
     */
    public override updateRawTexture(
        texture: Nullable<InternalTexture>,
        data: Nullable<ArrayBufferView>,
        format: number,
        invertY: boolean,
        compression: Nullable<string> = null,
        type: number = Constants.TEXTURETYPE_UNSIGNED_BYTE,
        useSRGBBuffer: boolean = false
    ): void {
        if (texture) {
            texture._bufferView = data;
            texture.format = format;
            texture.invertY = invertY;
            texture._compression = compression;
            texture.type = type;
            texture._useSRGBBuffer = useSRGBBuffer;
        }
    }

    /**
     * Binds the frame buffer to the specified texture.
     * @param rtWrapper The render target wrapper to render to
     * @param faceIndex The face of the texture to render to in case of cube texture
     * @param requiredWidth The width of the target to render to
     * @param requiredHeight The height of the target to render to
     * @param forceFullscreenViewport Forces the viewport to be the entire texture/screen if true
     */
    public override bindFramebuffer(rtWrapper: RenderTargetWrapper, faceIndex?: number, requiredWidth?: number, requiredHeight?: number, forceFullscreenViewport?: boolean): void {
        if (this._currentRenderTarget) {
            this.unBindFramebuffer(this._currentRenderTarget);
        }
        this._currentRenderTarget = rtWrapper;
        this._currentFramebuffer = null;
        if (this._cachedViewport && !forceFullscreenViewport) {
            this.setViewport(this._cachedViewport, requiredWidth, requiredHeight);
        }
    }

    /**
     * Unbind the current render target texture from the webGL context
     * @param rtWrapper defines the render target wrapper to unbind
     * @param disableGenerateMipMaps defines a boolean indicating that mipmaps must not be generated
     * @param onBeforeUnbind defines a function which will be called before the effective unbind
     */
    public override unBindFramebuffer(rtWrapper: RenderTargetWrapper, disableGenerateMipMaps = false, onBeforeUnbind?: () => void): void {
        this._currentRenderTarget = null;

        if (onBeforeUnbind) {
            onBeforeUnbind();
        }
        this._currentFramebuffer = null;
    }

    /**
     * Creates a dynamic vertex buffer
     * @param vertices the data for the dynamic vertex buffer
     * @returns the new WebGL dynamic buffer
     */
    public override createDynamicVertexBuffer(vertices: FloatArray): DataBuffer {
        const buffer = new DataBuffer();
        buffer.references = 1;
        buffer.capacity = 1;
        return buffer;
    }

    /**
     * Update the content of a dynamic texture
     * @param texture defines the texture to update
     * @param canvas defines the canvas containing the source
     * @param invertY defines if data must be stored with Y axis inverted
     * @param premulAlpha defines if alpha is stored as premultiplied
     * @param format defines the format of the data
     */
    public override updateDynamicTexture(texture: Nullable<InternalTexture>, canvas: HTMLCanvasElement, invertY: boolean, premulAlpha: boolean = false, format?: number): void {}

    /**
     * Gets a boolean indicating if all created effects are ready
     * @returns true if all effects are ready
     */
    public override areAllEffectsReady(): boolean {
        return true;
    }

    /**
     * @internal
     * Get the current error code of the webGL context
     * @returns the error code
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getError
     */
    public override getError(): number {
        return 0;
    }

    /** @internal */
    public override _getUnpackAlignement(): number {
        return 1;
    }

    /**
     * @internal
     */
    public override _unpackFlipY(value: boolean) {}

    /**
     * Update a dynamic index buffer
     * @param indexBuffer defines the target index buffer
     * @param indices defines the data to update
     * @param offset defines the offset in the target index buffer where update should start
     */
    public override updateDynamicIndexBuffer(indexBuffer: WebGLBuffer, indices: IndicesArray, offset: number = 0): void {}

    /**
     * Updates a dynamic vertex buffer.
     * @param vertexBuffer the vertex buffer to update
     * @param vertices the data used to update the vertex buffer
     * @param byteOffset the byte offset of the data (optional)
     * @param byteLength the byte length of the data (optional)
     */
    public override updateDynamicVertexBuffer(vertexBuffer: WebGLBuffer, vertices: FloatArray, byteOffset?: number, byteLength?: number): void {}

    /**
     * @internal
     */
    public override _bindTextureDirectly(target: number, texture: InternalTexture): boolean {
        if (this._boundTexturesCache[this._activeChannel] !== texture) {
            this._boundTexturesCache[this._activeChannel] = texture;
            return true;
        }
        return false;
    }

    /**
     * @internal
     */
    public override _bindTexture(channel: number, texture: InternalTexture): void {
        if (channel < 0) {
            return;
        }

        this._bindTextureDirectly(0, texture);
    }

    protected override _deleteBuffer(buffer: WebGLBuffer): void {}

    /**
     * Force the engine to release all cached effects. This means that next effect compilation will have to be done completely even if a similar effect was already compiled
     */
    public override releaseEffects() {}

    public override displayLoadingUI(): void {}

    public override hideLoadingUI(): void {}

    public override set loadingUIText(_: string) {}

    public override flushFramebuffer(): void {}

    /**
     * @internal
     */
    public override _uploadCompressedDataToTextureDirectly(
        texture: InternalTexture,
        internalFormat: number,
        width: number,
        height: number,
        data: ArrayBufferView,
        faceIndex: number = 0,
        lod: number = 0
    ) {}

    /**
     * @internal
     */
    public override _uploadDataToTextureDirectly(texture: InternalTexture, imageData: ArrayBufferView, faceIndex: number = 0, lod: number = 0): void {}

    /**
     * @internal
     */
    public override _uploadArrayBufferViewToTexture(texture: InternalTexture, imageData: ArrayBufferView, faceIndex: number = 0, lod: number = 0): void {}

    /**
     * @internal
     */
    public override _uploadImageToTexture(texture: InternalTexture, image: HTMLImageElement, faceIndex: number = 0, lod: number = 0) {}
}
