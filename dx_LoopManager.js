const DX_loopManager = class {
    constructor() {
        if(!!DX_loopManager.singleInstance){
            return DX_loopManager.singleInstance;
        }else {
            this.unique_init();
            DX_loopManager.singleInstance = this;
            return this;
        }
    }

    static frameInterval      = 1000/60;

    static framePerSecond     = 60;

    static performanceBefore  = 0;

    static singleInstance     = null;

    loopList                  = [];

    isPlay                    = false;

    loopListLength            = 0;

    unique_init() {

        const unique_mainFrame = (timestamp) => {
            DX_loopManager.frameInterval      = (timestamp-DX_loopManager.performanceBefore);
            DX_loopManager.framePerSecond     = (1000/(DX_loopManager.frameInterval));
            DX_loopManager.performanceBefore  = timestamp;

            if(this.isPlay){
                for(let i = 0; i < this.loopListLength; ++i){
                    const target = this.loopList[i];
                    target.loopObject[target.loopName]();
                };
            }

            requestAnimationFrame(unique_mainFrame);
        }

        if(!this.isPlay){
            this.isPlay = true;
        }

        requestAnimationFrame(unique_mainFrame);

    }

    register (loopOption , loopName = "frameFunction") {

        const obj = {
            loopName : loopName,
        };

        if (typeof loopOption === "object") {
            obj.loopObject = loopOption;
        }

        else if (typeof loopOption === "function") {
            obj.loopObject = {};
            obj.loopObject[loopName] = loopOption;
        }

        this.loopList.push(obj);
        this.loopListLength = this.loopList.length;
    }

    play() {
        this.isPlay = true;
    }

    pause () {
        this.isPlay = false;
    }

    remove () {
        // ...
    }

    cleanup () {
        this.isPlay = false;
        this.loopList = [];
        this.loopListLength = this.loopList.length;
    }

}
