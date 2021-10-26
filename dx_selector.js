const DX_selector = class {
	constructor() {
		if(!!DX_selector.singleInstance){
            return DX_selector.singleInstance;
        }else {
            DX_selector.singleInstance = DX_selector.select;
            return DX_selector.select;
        };
	};

    element = null;

	singleInstance = null;

    static select(selector) {
        let element = document.querySelectorAll(selector);
        element.length === 1 && (element = element[0]);
        return element;
    }

}

