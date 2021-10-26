function multiplyMatrixAndPoint(matrix, point) {
	// Give a simple variable name to each part of the matrix, a column and row number
	let c0r0 = matrix[ 0], c1r0 = matrix[ 1];
	let c0r1 = matrix[ 2], c1r1 = matrix[ 3];

	// Now set some simple names for the point
	let x = point[0];
	let y = point[1];

	// Multiply the point against each part of the 1st column, then add together
	let resultX = (x * c0r0) + (y * c0r1);

	// Multiply the point against each part of the 2nd column, then add together
	let resultY = (x * c1r0) + (y * c1r1);

	return [resultX, resultY];
}

function multiplyMatrices(matrixA, matrixB) {
	// Slice the second matrix up into rows
	let row0 = [matrixB[ 0], matrixB[ 1]];
	let row1 = [matrixB[ 2], matrixB[ 3]];

	// Multiply each row by matrixA
	let result0 = multiplyMatrixAndPoint(matrixA, row0);
	let result1 = multiplyMatrixAndPoint(matrixA, row1);

	// Turn the result rows back into a single matrix
	return [
		result0[0], result0[1],
		result1[0], result1[1],
	];
}

const DX_easeBase = class {

	constructor() {
		if(!!DX_easeBase.singleInstance){
            return DX_easeBase.singleInstance;
        }else {
            DX_easeBase.singleInstance = this;
            return this;
        }
	}

	singleInstance = null;

	static easeTypes = {
		linear 		: (t,b,c,d,) => c*t/d + b,
		inQuad 		: (t,b,c,d,) => {t /= d;return c*t*t + b;},
		outQuad 	: (t,b,c,d) => {t /= d;return -c * t*(t-2) + b;},
		inOutQuad 	: (t,b,c,d) => {t /= d/2;if (t < 1) return c/2*t*t + b;t--;return -c/2 * (t*(t-2) - 1) + b;},
		inCubic 	: (t,b,c,d) => c*(t/=d)*t*t + b,
		outCubic 	: (t,b,c,d) => c*((t=t/d-1)*t*t + 1) + b,
		inOutCubic 	: (t,b,c,d) => (t/=d/2) < 1 ? c/2*t*t*t + b : c/2*((t-=2)*t*t + 2) + b,
		inExpo 		: (t,b,c,d) => c * Math.pow( 2, 10 * (t/d - 1) ) + b,
		outExpo 	: (t,b,c,d) => c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b,
		inOutExpo 	: (t,b,c,d) => {t /= d/2;if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;t--;return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;},

		inBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
			return c*(t/=d)*t*((s+1)*t - s) + b;
		},
		outBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		},
		inOutBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158; 
			if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
			return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		},
	}

	easeStacks = [];

	easeStacksLength = 0;

	isUseFrame = false;

	addEase(options) {

		const eo = {
			updateProgress 		: 0 ,
			updateValue 		: options.start || 0 ,
			progressDistance 	: 0 ,
			start 				: 0 ,
			end 				: 0 ,
			currentTime 		: 0 ,
			pointer 			: 0 ,
			frameLength 		: DX_loopManager &&  Math.round(options.duration/(DX_loopManager.frameInterval)) ,
			frameFunction 		: () => {} ,
			ease 				: DX_easeBase.easeTypes.linear,
			duration 			: 1000,
			timeline 		: [],
			...options ,
		};

		typeof eo.end 	=== 'number' && (eo.updateProgressDistance = eo.start - eo.end);
		typeof eo.ease 	=== 'string' && (eo.ease = DX_easeBase.easeTypes[eo.ease]);

		eo.startFunction && eo.startFunction();

		// for(let i = 0; i < eo.frameLength; ++i){

		// 	const beforeProgress 	= eo.updateProgress;
		// 	let currentTime 		= eo.ease(i , 0 , eo.duration, eo.frameLength);
		// 	let updateProgress 		= currentTime / eo.duration;
		// 	let updateValue 		= eo.start - (eo.updateProgressDistance * updateProgress);
		// 	let changeProgress  	= updateProgress - beforeProgress;
		// 	let changeValue 		= eo.start - (eo.updateProgressDistance * changeProgress);

		// 	eo.timeline.push({
		// 		currentTime,
		// 		updateProgress,
		// 		updateValue,
		// 		changeProgress,
		// 		changeValue
		// 	});
		// }

		console.log(eo.timeline)

		this.easeStacks.push(eo);
		this.easeStacksLength = this.easeStacks.length;

		if(!this.isUseFrame){
			this.isUseFrame = true;
		}

		return eo;

	}

	frameFunction() {

		if(!this.isUseFrame) {return};

		for(let i = 0; i < this.easeStacksLength; ++i){
			const eo 			 	= this.easeStacks[i];
			const beforeProgress 	= eo.updateProgress;

			!eo.frameLength && (eo.frameLength = Math.round(eo.duration/(DX_loopManager.frameInterval)));
			eo.currentTime 			= eo.ease(eo.pointer , 0 , eo.duration, eo.frameLength);

			eo.updateProgress 		= eo.currentTime / eo.duration;
			eo.updateValue 			= eo.start - (eo.updateProgressDistance * eo.updateProgress);

			eo.changeProgress  		= eo.updateProgress - beforeProgress;
			eo.changeValue 			= eo.start - (eo.updateProgressDistance * eo.changeProgress);

			eo.pointer++;

			eo.frameFunction(eo);

			if(eo.pointer > eo.frameLength){
				this.finish(eo,i);
			};

		}

	}

	finish (eo, i) {

		eo.finishFunction && eo.finishFunction(eo);

		this.easeStacks.splice(i,1);
		this.easeStacksLength = this.easeStacks.length;

		if(!this.easeStacks.length){
			this.isUseFrame = false;
		}

	}

}

// x,y,z,
// scale, scaleX , scaleY , scaleZ,
// rotate , rotateX , rotateY , rotateZ ,
// skew , skewX , skewY , skewZ,
// perspective

const DX_easeDOM = class extends DX_easeBase {
	constructor() {
		super();
	}

	static cutValue = (v) => ({
		value : parseInt(v),
		unit  : (''+v).replace(/[0-9\-]/gi,'') || 0,
	});

	static unitSheet = {
		'left' 				: 'px' ,
		'top' 				: 'px' ,
		'right' 			: 'px' ,
		'bottom' 			: 'px' ,
		'font-size' 		: 'px' ,
		'fontSize' 			: 'px' ,
		'width' 			: 'px' ,
		'height' 			: 'px' ,
		'padding' 			: 'px' ,
		'letterp-spacing'	: 'px' ,
		'letterpSpacing' 	: 'px' ,
		'line-height' 		: 'px' ,
		'lineHeight' 		: 'px' ,
		'margin'			: 'px' ,
		'margin-top'		: 'px' ,
		'marginTop'			: 'px' ,
		'margin-left'		: 'px' ,
		'marginLeft'		: 'px' ,
		'margin-right'		: 'px' ,
		'marginRight'		: 'px' ,
		'margin-bottom'		: 'px' ,
		'marginBottom'		: 'px' ,
		'padding'			: 'px' ,
		'padding-top'		: 'px' ,
		'paddingTop'		: 'px' ,
		'padding-left'		: 'px' ,
		'paddingLeft'		: 'px' ,
		'padding-right'		: 'px' ,
		'paddingRight'		: 'px' ,
		'padding-bottom'	: 'px' ,
		'paddingBottom'		: 'px' ,
		// ...
	}

	// https://developer.mozilla.org/ko/docs/Web/CSS/transform-function
	static transformList = [
		"x" , "X", "xP",
		"y" , "Y", "yP",
		"z" , "Z", "zP",
		"scale" , "scaleX" , "scaleY" , "scaleZ",
		"skew" , "skewX" , "skewY",
		"rotate" , "rotateX" , "rotateY" , "rotateZ",
		"perspective",
	]

	static setModify(eo) {

		const targetStyles = getComputedStyle(eo.target);

		for(let [k,v] of Object.entries(eo.modify)){

			const isUseUnit = DX_easeDOM.unitSheet[k] || false;
			const origins = DX_easeDOM.cutValue(targetStyles[k]);
			const modifys = isUseUnit ? DX_easeDOM.cutValue(v) : { value : eo.modify[k] , unit : 0};

		//트랜스폼일경우
			if(DX_easeDOM.transformList.indexOf(k) > -1){

			// 트랜스폼 최초 발견 시에만..
				if(!eo.useTransform) {
					eo.useTransform = true;
					eo.modifyMatrix = {
						start 	: targetStyles.transform.slice(7,-1).split(',').map(n=>parseFloat(n)) ,
						end   	: [
							1 , 0 , // scaleX 	, skewX
							0 , 1 , // skewY 	, scaleY
							0 , 0   // x        , y
						],
					};

				};

			// 값을 매트릭스로 정교하게 변환해보자

				v = parseFloat(v);

				let multipleArray = [1,0,0,1];

				const tan = Math.tan(v * Math.PI / 180);

				const cos = Math.cos(v * Math.PI / 180);

				const sin = Math.sin(v * Math.PI / 180);

				switch (k) {

					case ("x" || "X") : {
						eo.modifyMatrix.end[4] = v;
						break;
					}

					case ("y" || "Y") : {
						eo.modifyMatrix.end[5] = v;
						break;
					}

					case ("skewX") : {
						multipleArray = [
							1 , 0 ,
							tan , 1 ,
						];
						break;
					}

					case ("skewY") : {
						multipleArray = [
							1 , tan ,
							0 , 1 ,
						];
						break;
					}

					case ("scale") : {
						multipleArray = [
							v , 0 ,
							0 , v ,
						];
						break;
					}

					case ("scaleX") : {
						multipleArray = [
							v , 0 ,
							0 , 1 ,
						];
						break;
					}

					case ("scaleY") : {
						multipleArray = [
							1 , 0 ,
							0 , v ,
						];
						break;
					}

					case ("rotate") : {
						multipleArray = [
							cos , sin ,
							-sin , cos ,
						];
						break;
					}

					case ("rotateX") : {
						multipleArray = [
							cos , sin ,
							0 , 1 ,
						];
						break;
					}

					case ("rotateY") : {
						multipleArray = [
							1 , 0 ,
							-sin , cos ,
						];
						break;
					}

					default: {break}
				};

				eo.modifyMatrix.end = [
					...multiplyMatrices(eo.modifyMatrix.end.slice(0,4), multipleArray),
					...eo.modifyMatrix.end.slice(4)
				];

		//트랜스폼 아닐경우
			}else {
				eo.modify[k] = {
					start	 : origins.value ,
					end  	 : modifys.value ,
					distance : modifys.value - origins.value ,
					unit 	 : modifys.unit  ,
				};
			};

		};
		// console.log(eo.modifyMatrix.end);

		if(eo.useTransform){
			const mtx 		= eo.modifyMatrix;
			const mtxLength = mtx.start.length;
			mtx.distance 	= [];

			for(let i = 0; i < mtxLength; ++i){
				mtx.distance.push(mtx.end[i] - mtx.start[i]);
			}
		}

	}

	static checkArgumentsType = (options) => {

		if (options[0] instanceof HTMLElement) {
			options = {
				target 	  	: options[0],
				duration  	: options[1],
				ease 		: options[2],
				modify 		: options[3],
				options 	: options[4],
				actions 	: options[5],
			}
		} else {
			options = options[0];
		}

		return options;

	}

	to(options) {

		const eo = DX_easeDOM.checkArgumentsType(arguments);

		DX_easeDOM.setModify(eo);

		eo.frameFunction = (eo) => {

			for(const [k,v] of Object.entries(eo.modify)){
				eo.target.style[k] = v.start + (v.distance*eo.updateProgress) + v.unit;
			}

			if(eo.useTransform){
				const start 		= eo.modifyMatrix.start;
				const end 			= eo.modifyMatrix.end;
				const distance 		= eo.modifyMatrix.distance;
				const length 		= start.length;
				const clacMatrix 	= [];

				for(let i = 0; i < length; ++i){
					let value;
					value = start[i] + (distance[i]*eo.updateProgress);
					clacMatrix.push(value);
				}
				eo.target.style.transform = `matrix(${clacMatrix})`;
			}

		}

		this.addEase(eo);

	}

	from(options) {

		const eo = DX_easeDOM.checkArgumentsType(arguments);

		DX_easeDOM.setModify(eo);

		eo.frameFunction = (eo) => {

			for(const [k,v] of Object.entries(eo.modify)){
				eo.target.style[k] = v.end - (v.distance*eo.updateProgress) + v.unit;
			}

		}

		this.addEase(eo);

	}

}


