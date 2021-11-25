window.onload=function()
{
var oval;

var Sketchbox={
    SAVE_LIST:"saveList",
    canvas:undefined,
    selectedShapes:[],
    dragShape:null,
    rotateShape:null,
    dragHandle:null,
    saveList:[],
    dialog:{
        dialogWindow:undefined,
        saveDialog:undefined,
        loadDialog:undefined,
        message:undefined,
        saveName:undefined,
        loadName:undefined,
        messageTimeout:undefined,

        init:function(saveList)
            {
            var exitButtons,onClickEvent,option;

            this.dialogWindow=document.getElementById("dialogWindow");
            this.dialogWindow.onclick=function(){
                Sketchbox.dialog.onClickDialogWindow();
                };   
            
            this.saveDialog=document.getElementById("saveDialog");   
            this.loadDialog=document.getElementById("loadDialog");   
            this.message=document.getElementById("message");

            this.saveName=document.getElementById("saveName");

            if(saveList.length > 0)
                {
                this.saveName.value=saveList[saveList.length-1];    
                }

            document.getElementById("dialogBtnSave").onclick=function(event){
                event.stopPropagation();
                Sketchbox.dialog.onSave();
                };

            this.loadName=document.getElementById("loadName");

             for (var i = 0; i < saveList.length; i++) 
                {
                option = document.createElement("option");
                option.text = saveList[i];
                option.value = saveList[i];

                this.loadName.add(option); 
                } 

            document.getElementById("dialogBtnLoad").onclick=function(event){
                event.stopPropagation();
                Sketchbox.dialog.onLoad();
                };
            
            exitButtons=this.dialogWindow.getElementsByClassName("dialogExitButton");

            onClickEvent=function(event){
                event.stopPropagation();
                Sketchbox.dialog.closeDialogWindow();
                };  
            
            for (var i = 0; i < exitButtons.length; i++) 
                {
                exitButtons[i].onclick=onClickEvent;
                }
    
            },

        addLoadOption:function(loadOption)
            {
            var option= document.createElement("option");
            option.text = loadOption;
            option.value = loadOption;

            this.loadName.add(option); 
            },
        
        showDialogWindow:function()
            {
            this.dialogWindow.style.display="flex";
            },

        hideDialogWindow:function()
            {
            this.dialogWindow.style.display="none";
            },
        
        showSaveDialog:function()
            {
            this.showDialogWindow();
            this.saveDialog.style.display="block";
            },
        
        showLoadDialog:function()
            {
            this.showDialogWindow();
            this.loadDialog.style.display="block";
            },
        
        hideDialogs:function()
            {
            this.saveDialog.style.display="none";
            this.loadDialog.style.display="none";
            },
        
        showMessage:function()
            {
            this.hideDialogs();
            this.message.style.display="block";
            },

        hideMessage:function()
            {
            this.message.style.display="none";
            },

        closeDialogWindow:function()
            {
            this.hideDialogWindow();
            this.hideDialogs();
            this.hideMessage();
            },
        
         onSave:function()
            {
            var name=this.saveName.value;

            if(name.length > 0)
                {
                Sketchbox.saveCanvas(name);

                this.showMessage();

                this.messageTimeout=setTimeout(function(){ 
                    Sketchbox.dialog.closeDialogWindow();
                    }, 3000);

                }
            },
        
         onLoad:function()
            {
            var name=this.loadName.options[this.loadName.selectedIndex].value;

            Sketchbox.loadCanvas(name);

            this.closeDialogWindow();
        },
        
        onClickDialogWindow:function()
            {
            if(this.messageTimeout)
                {
                clearTimeout(this.messageTimeout);

                this.messageTimeout=undefined;

                this.closeDialogWindow();
                }
            
            },
        
        }, 

    init:function()
        {
        var jsonSaveList=localStorage.getItem(this.SAVE_LIST);

        if(jsonSaveList)
            {
            this.saveList=JSON.parse(jsonSaveList);   
            }

        this.dialog.init(this.saveList);
        
        this.canvas=document.getElementById("canvas");

        if(this.saveList.length > 0)
            {
            this.loadCanvas(this.saveList[this.saveList.length-1]);     
            }

        document.getElementById("btnRect").addEventListener("click",function(){
            Sketchbox.addRect(); 
            } );
        
        document.getElementById("btnOval").addEventListener("click",function(){
            Sketchbox.addOval();
            });

        document.getElementById("btnColor").addEventListener("change",function(event){
            Sketchbox.setColor(event.currentTarget.value);
            });
        
        document.getElementById("btnDelete").addEventListener("click",function(){
            Sketchbox.onDelete();
            });
        
        document.getElementById("btnClear").addEventListener("click",function(){
            Sketchbox.clearCanvas();
            });
        
        document.getElementById("btnSave").addEventListener("click",function(){
            Sketchbox.dialog.showSaveDialog();
            });

        document.getElementById("btnLoad").addEventListener("click",function(){
            Sketchbox.dialog.showLoadDialog();
            });
        
        document.onkeydown=function(event){
            if(event.keyCode == 46) //Delete key
                {
                Sketchbox.onDelete();    
                }
            };

        document.onmouseup=function(event){
            Sketchbox.onMouseUp(event.ctrlKey);
            };
        
        document.onmousemove=function(event){
            Sketchbox.onCanvasMouseMove(event);
            };   
        },

    onMouseUp:function(isCtrlHold)
        {
        if(this.dragShape !== null && !this.dragShape.isMove)
            {
            this.onClickShape(this.dragShape.shape, isCtrlHold);
            }
        
        this.rotateShape=null;
        this.dragShape=null;
        this.dragHandle=null;   
        },
    
    onShapeMouseDown:function(event)
        {

        Sketchbox.dragShape={
            shape:event.currentTarget,
            lastX:event.pageX,
            lastY:event.pageY,
            isMove:false,
            updateMove:function(x,y){
                var distanceX,distanceY;

                if(!this.isMove)
                    {
                    distanceX=Math.abs(this.lastX-x);
                    distanceY=Math.abs(this.lastY-y);

                    if(distanceX > 5 || distanceY > 5)
                        {
                        this.isMove=true; 
                        Sketchbox.deselectShapes();
                        Sketchbox.selectShape(this.shape);
                        }
                    }

                return this.isMove;    
                }                
            };
        },

    onCanvasMouseMove:function(event)
        {
        
        if(this.dragShape !== null &&  this.dragShape.updateMove(event.pageX, event.pageY))
            {
            this.onMoveShape(event.pageX, event.pageY);
            }
        
        if(this.rotateShape !== null)
            {
            this.onRotateShape(event.pageX, event.pageY);
            }
        
        if(this.dragHandle != null )
            {
            this.onResizeShape(event.pageX,event.pageY);   
            }
        },
        
    onMoveShape:function(pageX,pageY)
        {
        var distanceX=pageX-this.dragShape.lastX;
        var distanceY=pageY-this.dragShape.lastY;
        
        var newLeft = this.dragShape.shape.offsetLeft + distanceX;
        var newTop = this.dragShape.shape.offsetTop + distanceY;
        var newRight = newLeft + this.dragShape.shape.clientWidth;
        var newBottom = newTop + this.dragShape.shape.clientHeight;

        this.dragShape.lastX=pageX;
        this.dragShape.lastY=pageY;
        

        if(newLeft < 0)
            {
            newRight=newRight + Math.abs(newLeft);
            newLeft=0;
            }

        if(newRight > this.canvas.clientWidth)
            {
            newLeft= newLeft + this.canvas.clientWidth - newRight;
            newRight=this.canvas.clientWidth;
            }
        
        if(newTop < 0)
            {
            newBottom=newBottom + Math.abs(newTop);
            newTop=0;
            }

        if(newBottom > this.canvas.clientHeight)
            {
            newTop= newTop + this.canvas.clientHeight - newBottom;
            newBottom=this.canvas.clientHeight;
            }
        
        this.dragShape.shape.style.left= newLeft +"px";
        this.dragShape.shape.style.top= newTop +"px";
        this.dragShape.shape.style.right= this.getReversePositionX(newRight) + "px";
        this.dragShape.shape.style.bottom= this.getReversePositionY(newBottom) + "px";
        },

    onResizeShape:function(pageX,pageY)
        {
        var canvasX=pageX-this.canvas.offsetLeft;
        var canvasY=pageY-this.canvas.offsetTop;

        canvasX=Math.max(canvasX,0);
        canvasX=Math.min(canvasX,this.canvas.clientWidth);

        canvasY=Math.max(canvasY,0);
        canvasY=Math.min(canvasY,this.canvas.clientHeight);

        switch(this.dragHandle.handleClass)
            {
            case "handleTopLeft":

                canvasX=Math.min(canvasX,this.dragHandle.shape.offsetLeft + this.dragHandle.shape.clientWidth );
                canvasY=Math.min(canvasY,this.dragHandle.shape.offsetTop + this.dragHandle.shape.clientHeight );

                this.dragHandle.shape.style.left=canvasX +"px";
                this.dragHandle.shape.style.top=canvasY +"px";
                break;

            case "handleTopRight":
                canvasX=Math.max(canvasX,this.dragHandle.shape.offsetLeft);
                canvasY=Math.min(canvasY,this.dragHandle.shape.offsetTop + this.dragHandle.shape.clientHeight );

                this.dragHandle.shape.style.right=this.getReversePositionX(canvasX) +"px";
                this.dragHandle.shape.style.top=canvasY +"px";
                break;

            case "handleBottomLeft":
                canvasX=Math.min(canvasX,this.dragHandle.shape.offsetLeft + this.dragHandle.shape.clientWidth );
                canvasY=Math.max(canvasY,this.dragHandle.shape.offsetTop);

                this.dragHandle.shape.style.left=canvasX +"px";
                this.dragHandle.shape.style.bottom=this.getReversePositionY(canvasY) +"px";
                break;

            case "handleBottomRight":
                canvasX=Math.max(canvasX,this.dragHandle.shape.offsetLeft);
                canvasY=Math.max(canvasY,this.dragHandle.shape.offsetTop);

                this.dragHandle.shape.style.right=this.getReversePositionX(canvasX) +"px";
                this.dragHandle.shape.style.bottom=this.getReversePositionY(canvasY) +"px";
                break;
            }
        },
    
    onRotateShape:function(pageX,pageY)
        {
        var radians = Math.atan2(pageY - this.rotateShape.startY, pageX - this.rotateShape.startX );
        var degree = radians * (180 / Math.PI);

        this.rotateShape.shape.style.transform = "rotate("+degree+"deg)"; 
        },
    
    createRect:function()
        {
        var rectWidth,rectHeight,rectLeft,rectTop;   
        var rect=document.createElement("div");
        
        rect.className="shape";;

        rect.style.position = "absolute";
        rectWidth=this.getRandomNumber(0,this.canvas.clientWidth);
        rectHeight=this.getRandomNumber(0,this.canvas.clientHeight);

        rectLeft=this.getRandomNumber(0, (this.canvas.clientWidth - rectWidth) );
        rectTop=this.getRandomNumber(0, (this.canvas.clientHeight - rectHeight) );

        rect.style.left= rectLeft+ "px";
        rect.style.top= rectTop+ "px";
        rect.style.right= this.getReversePositionX(rectLeft + rectWidth) + "px";
        rect.style.bottom= this.getReversePositionY(rectTop + rectHeight) + "px";

        rect.style.backgroundColor=this.getRandomColor();
        rect.style.cursor="pointer";
        
        rect.onmousedown = this.onShapeMouseDown;  
        
        return rect;
        },
    
    getReversePositionX:function(x)
        {
        return this.canvas.clientWidth - x;
        },
    
    getReversePositionY:function(y)
        {
        return this.canvas.clientHeight - y;
        },
    
    addRect:function()
        {
        var rect=this.createRect();

        this.canvas.appendChild(rect);
        },

    addOval:function()
        {
        var oval=this.createRect();

        oval.style.borderRadius="50%";

        this.canvas.appendChild(oval);   
        },

    getRandomNumber:function(min,max)
        {
        return Math.floor(Math.random() * (max-min) ) + min;   
        },  
    
    getRandomColor:function()
        {
        return "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255)  + "," + Math.floor(Math.random() * 255)  + ")";   
        },
     
    onClickShape:function(shape, isCtrlHold)
        {

        if(this.isShapeSelected(shape))
            {
            if(this.selectedShapes.length > 1)
                {
                this.deselectShapes(); 
                this.selectShape(shape);   
                }else
                    {
                    this.deselectShape(shape);  
                    this.selectedShapes.splice(this.selectedShapes.indexOf(shape), 1);
                    } 
            }else
                {
                if(!isCtrlHold)
                    {
                    this.deselectShapes();
                    }

                this.selectShape(shape);
                }  
        }, 

    isShapeSelected:function(shape) 
        {
        return (this.selectedShapes.indexOf(shape) >= 0);  
        },

    selectShape:function(shape) 
        {
        this.addHandles(shape);
        shape.style.zIndex = "1";
        this.selectedShapes.push(shape);
        },

    deselectShapes:function() 
        {

        while(this.selectedShapes.length > 0) 
            {
            this.deselectShape(this.selectedShapes.pop());
            }
        },

    deselectShape:function(shape) 
        {
        var handles=shape.getElementsByClassName("handles");
        
        shape.style.zIndex = "";

        if(handles.length > 0)
            {
            this.removeElementFromHtml(handles[0]);
            }
        },

    addHandles:function(shape)
        {
        var handles=document.createElement("div");

        handles.className="handles";

        handles.appendChild(this.createHandle(shape,"handleTopLeft"));
        handles.appendChild(this.createHandle(shape,"handleTopRight"));
        handles.appendChild(this.createHandle(shape,"handleBottomLeft"));
        handles.appendChild(this.createHandle(shape,"handleBottomRight"));

        shape.appendChild(handles);
        },

    createHandle:function(shape,className)
        {
        var handle=document.createElement("div");

        handle.className="handle " + className;

        handle.onmousedown=function(event)
            {
            var className="handle";
            event.preventDefault();

            if(event.pageY - Sketchbox.canvas.offsetTop - Sketchbox.canvas.clientTop - shape.offsetTop  < handle.offsetHeight)
                {
                className+="Top";
                }else
                    {
                    className+="Bottom";
                    }
                
            if(event.pageX - Sketchbox.canvas.offsetLeft - Sketchbox.canvas.clientLeft - shape.offsetLeft  < handle.offsetWidth)
                {
                className+="Left";
                }else
                    {
                    className+="Right";
                    }

            if(!event.ctrlKey)
                {
                Sketchbox.dragHandle={
                    shape:shape,
                    handleClass:className,
                    };
                  
                }else
                    {
                    Sketchbox.rotateShape={
                        shape:shape,
                        startX:event.pageX,
                        startY:event.pageY,
                        };
                    }
                
            Sketchbox.deselectShapes();
            Sketchbox.selectShape(shape);

            event.cancelBubble=true;
            };

        return handle;
        },
     
    setColor:function(color)
        {
        for (var i = 0; i < this.selectedShapes.length; i++) 
            {
            this.selectedShapes[i].style.backgroundColor=color;
            }
        },

    onDelete:function()
        {
        var shape;

        while(this.selectedShapes.length > 0) 
            {
            shape=this.selectedShapes.pop();
            this.removeElementFromHtml(shape);
            }
        },

    removeElementFromHtml:function(element) 
        {
        element.parentNode.removeChild(element);
        }, 
   
   saveCanvas:function(name) 
        {
        var shapes;
        var shapeObjects=[];

        shapes=this.canvas.getElementsByClassName("shape");

        for (var i = 0; i < shapes.length; i++) 
            {

            shapeObjects.push({
                left:shapes[i].style.left,
                top:shapes[i].style.top,
                right:shapes[i].style.right,
                bottom:shapes[i].style.bottom,
                color:shapes[i].style.backgroundColor,
                borderRadius:shapes[i].style.borderRadius
                });
                
            }

        this.addCanvasSave(name,shapeObjects);
        },
    
    addCanvasSave:function(canvasSaveName,canvasSave) 
        {
        localStorage.setItem(canvasSaveName, JSON.stringify(canvasSave));

        if(!this.saveList.includes(canvasSaveName) )
            {
            this.saveList.push(canvasSaveName);
            this.dialog.addLoadOption(canvasSaveName);

            localStorage.setItem(this.SAVE_LIST, JSON.stringify(this.saveList));
            }
        },

    loadCanvas:function(canvasSaveName) 
        {
        var canvasSave;
        var jsonCanvasSaves=localStorage.getItem(canvasSaveName);

        if(jsonCanvasSaves)
            {
            canvasSave=JSON.parse(jsonCanvasSaves);

            this.clearCanvas();

            for (var i = 0; i < canvasSave.length; i++) 
                {
                this.addShape(canvasSave[i]);
                }
            }
        },   
    
    clearCanvas:function() 
        {
        while(this.canvas.firstChild)
            {
            this.canvas.removeChild(this.canvas.firstChild);
            }
        },   

    addShape:function(shapeObject)
        {  
        var shape=document.createElement("div");

        shape.className="shape";;

        shape.style.position = "absolute";
        shape.style.left= shapeObject.left;
        shape.style.top= shapeObject.top;
        shape.style.right= shapeObject.right;
        shape.style.bottom= shapeObject.bottom;

        shape.style.borderRadius=shapeObject.borderRadius;

        shape.style.backgroundColor=shapeObject.color;
        shape.style.cursor="pointer";
        
        shape.onmousedown = this.onShapeMouseDown;    
        
        this.canvas.appendChild(shape);
        }
    }
    
Sketchbox.init();

};
