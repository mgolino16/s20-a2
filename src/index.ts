import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Plane, Color3 } from "@babylonjs/core/Maths/math";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { StandardMaterial } from "@babylonjs/core/materials/standardMaterial";
//import { Texture } from "@babylonjs/core/materials/Textures/texture";
import "@babylonjs/core/materials/standardMaterial";


import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
//import { AdvancedDynamicTexture } from "@babylonjs/core";

import "@babylonjs/core/cameras/VR";
import "@babylonjs/core";

import * as GUI from '@babylonjs/gui';


// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import {MeshBuilder} from  "@babylonjs/core/Meshes/meshBuilder";
import { float, DeepImmutable } from "../node_modules/@babylonjs/core/types";
import { Observable, EventState } from "../node_modules/@babylonjs/core/Misc/observable";
import { Mesh, VRExperienceHelper, Texture, AbstractMesh } from "@babylonjs/core";
import { typestate } from "typestate";

var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element 
var engine = new Engine(canvas, true); // Generate the BABYLON 3D engine

//Status box variables, declared globally so messages can be sent from anywhere
var messageQueue: string[] = [];
var tbMini = new GUI.TextBlock();
var tb = new GUI.TextBlock();

//Global arrays
var toolsArray: GUI.Button[] = [];
var paletteArray: GUI.Container[] = [];
var texturesArray: GUI.Button[] = [];

var createdMeshesArray: Mesh[] = [];


//Typestate FSM Setup

enum ToolSelection {
    NoTool,
    Line,
    Pen,
    Eraser
}

// Construct the FSM with the inital state, in this case no tool selected
var fsm = new typestate.FiniteStateMachine<ToolSelection>(ToolSelection.NoTool);

// Declare the valid state transitions to model your system
fsm.from(ToolSelection.NoTool).to(ToolSelection.Line);
fsm.from(ToolSelection.NoTool).to(ToolSelection.Pen);
fsm.from(ToolSelection.NoTool).to(ToolSelection.Eraser);

fsm.from(ToolSelection.Line).to(ToolSelection.Eraser);
fsm.from(ToolSelection.Line).to(ToolSelection.Pen);

fsm.from(ToolSelection.Pen).to(ToolSelection.Line);
fsm.from(ToolSelection.Pen).to(ToolSelection.Eraser);

fsm.from(ToolSelection.Eraser).to(ToolSelection.Pen);
fsm.from(ToolSelection.Eraser).to(ToolSelection.Line);

/******* Add the Playground Class with a static CreateScene function ******/
class Playground {
    public static CreateScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
        // Create the scene space
        var scene = new Scene(engine);
        //var VRHelper = scene.createDefaultVRExperience();

        // Camera stuff
        var camera = new UniversalCamera("UniversalCamera", new Vector3(0, 0, -10), scene);
        camera.attachControl(canvas, true);
        camera.position = new Vector3(16, 1, 4);
        camera.setTarget(new Vector3(0, 1, 0)); // Targets the camera to look at a particular position. In this case the scene origin

        // Add lights to the scene
        var light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        //var light2 = new PointLight("light2", new Vector3(0, 1, -1), scene

        //ground

        var ground = MeshBuilder.CreateGround("ground", { height: 25, width: 25, subdivisions: 4 }, scene);
        ground.position = new Vector3(4, 0, 4); //center under camera

        //material creation
        var bMaterial = new StandardMaterial("bMaterial", scene);


        // Add and manipulate meshes in the scene

        var sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
        sphere.material = bMaterial;



        //----------FLOAT GUI OBJECTS -----------------
        var guiFloatPlaneMain = MeshBuilder.CreatePlane("plane", { width: 2, height: 2, sideOrientation: Mesh.BACKSIDE }, scene);
        guiFloatPlaneMain.position = new Vector3(14, 1, 1);
        guiFloatPlaneMain.isVisible = false;

        if (scene.activeCamera) {
            guiFloatPlaneMain.lookAt(scene.activeCamera.position , 0);
        }
        

        var guiFloatPlaneControls = MeshBuilder.CreatePlane("plane", { width: 1, height: 1 }, scene);
        guiFloatPlaneControls.setParent(guiFloatPlaneMain);
        guiFloatPlaneControls.position = new Vector3(-0.5, 0.25, .01);
        guiFloatPlaneControls.rotation = new Vector3(0, Math.PI, 0);


        var guiFloatPlaneStatus = MeshBuilder.CreatePlane("plane", { width: 1, height: 1 }, scene);
        guiFloatPlaneStatus.setParent(guiFloatPlaneMain);
        guiFloatPlaneStatus.position = new Vector3(0.55, -0.15, .01);
        guiFloatPlaneStatus.rotation = new Vector3(0, Math.PI, 0);

        var guiFloatPlaneMenu = MeshBuilder.CreatePlane("plane", { width: 1, height: 1 }, scene);
        guiFloatPlaneMenu.setParent(guiFloatPlaneMain);
        guiFloatPlaneMenu.position = new Vector3(0.55, 0.5, .01);
        guiFloatPlaneMenu.rotation = new Vector3(0, Math.PI, 0);




        //----------HAND GUI OBJECTS -----------------
        var guiHandPlaneMain = MeshBuilder.CreatePlane("plane", { width: 0.5, height: 0.5 }, scene);
        var guiHandPlaneStatus = MeshBuilder.CreatePlane("plane", { width: 0.25, height: 0.25 }, scene);
        var guiHandPlaneMenu = MeshBuilder.CreatePlane("plane", { width: 0.25, height: 0.25 }, scene);

        var guiHandPlaneToggle = MeshBuilder.CreatePlane("plane", { width: 0.25, height: 0.25 }, scene);
        var guiHandPlaneSummon = MeshBuilder.CreatePlane("plane", { width: 0.25, height: 0.25 }, scene);
        var guiHandPlaneTriggerInst = MeshBuilder.CreatePlane("plane", { width: 0.25, height: 0.25 }, scene);

        //----------VR Hand GUI Stuff ------------------
        var VRHelper = scene.createDefaultVRExperience();
        VRHelper.enableInteractions();
        VRHelper.enableTeleportation({
            floorMeshName: "ground"
        });

        //Set hand GUI locations and orientations
        VRHelper.onControllerMeshLoaded.add((webVRController) => {
            if (webVRController.hand == "left") {
                guiHandPlaneMain.setParent(webVRController.mesh);
                guiHandPlaneMain.position = new Vector3(0, 0.2, -0.25);
                guiHandPlaneMain.rotation = new Vector3(Math.PI / 4, Math.PI, 0);

                guiHandPlaneStatus.setParent(webVRController.mesh);
                guiHandPlaneStatus.position = new Vector3(-0.15, -.02, .02);
                guiHandPlaneStatus.rotation = new Vector3(Math.PI / 4, Math.PI, 0);

                guiHandPlaneMenu.setParent(webVRController.mesh);
                guiHandPlaneMenu.position = new Vector3(0.2, -.04, .04);
                guiHandPlaneMenu.rotation = new Vector3(Math.PI / 4, Math.PI, 0);

                guiHandPlaneSummon.setParent(webVRController.mesh);
                guiHandPlaneSummon.position = new Vector3(-.01, -.04, .04);
                guiHandPlaneSummon.rotation = new Vector3(Math.PI / 4, Math.PI, 0);
            }

            if (webVRController.hand == "right") {
                guiHandPlaneToggle.setParent(webVRController.mesh);
                guiHandPlaneToggle.position = new Vector3(0.2, -.04, .04);
                guiHandPlaneToggle.rotation = new Vector3(Math.PI / 4, Math.PI, 0);

                guiHandPlaneTriggerInst.setParent(webVRController.mesh);
                guiHandPlaneTriggerInst.position = new Vector3(-.02, -.04, .04);
                guiHandPlaneTriggerInst.rotation = new Vector3(Math.PI / 4, Math.PI, 0);
            }

            
            webVRController.onTriggerStateChangedObservable.add((stateObject) => {
                if (webVRController.hand == "right") {
                    if (stateObject.value > 0.01) {
                        if (fsm.currentState == ToolSelection.NoTool) {
                            return;
                        }
                        else if (fsm.currentState == ToolSelection.Line) {
                            var newBox = MeshBuilder.CreateBox("box", { size: .05 }, scene);
                            newBox.position = (webVRController.getForwardRay().origin).add(new Vector3(0, 0.05, 0));

                            //could probably optimize this to check if any material properties have changed since the last time rather than making a new mat for ever sphere 
                            var newMatName = "bMaterial" + createdMeshesArray.length;
                            var newMat = new StandardMaterial(newMatName, scene);
                            newMat.diffuseColor.copyFrom(bMaterial.diffuseColor);
                            newMat.diffuseTexture = bMaterial.diffuseTexture;
                            newBox.material = newMat;

                            createdMeshesArray.push(newBox);
                        }
                        else if (fsm.currentState == ToolSelection.Pen) {
                            var newSphere = MeshBuilder.CreateSphere("sphere", { diameter: 0.05 }, scene);
                            newSphere.position = (webVRController.getForwardRay().origin).add(new Vector3(0, 0.05, 0));

                            //could probably optimize this to check if any material properties have changed since the last time rather than making a new mat for ever sphere

                            var newMatName = "bMaterial" + createdMeshesArray.length;  
                            var newMat = new StandardMaterial(newMatName, scene);
                            newMat.diffuseColor.copyFrom(bMaterial.diffuseColor);
                            newMat.diffuseTexture = bMaterial.diffuseTexture;
                            newSphere.material = newMat;


                            createdMeshesArray.push(newSphere); //should we just add name instead of entire object? Does it matter?
                        }
                        else if (fsm.currentState == ToolSelection.Eraser) {
                            //if (webVRController.mesh?._intersectionsInProgress) {
                            //    for (var i = 0; i < createdMeshesArray.length; i++) {
                            //        webVRController.mesh.intersectsMesh(createdMeshesArray[i])
                            //    }
                            //}


                            var eraseRayIntersections = webVRController.getForwardRay(0.05).intersectsMeshes(<Array<DeepImmutable<AbstractMesh>>>createdMeshesArray);
                            for (var i = 0; i < eraseRayIntersections.length; i++) {
                                for (var j = 0; j < createdMeshesArray.length; j++) {
                                    if (eraseRayIntersections[i].pickedMesh == createdMeshesArray[j]) {
                                        messageUpdate("Destroy: " + eraseRayIntersections[i].pickedMesh?.name);
                                        eraseRayIntersections[i].pickedMesh?.dispose();
                                    }
                                }
                            }
                        }   
                    }


                }
            });
           

            //PRESS X Button -- SUMMON GUI IN FLOATING MODE
            webVRController.onMainButtonStateChangedObservable.add((stateObject) => {
                if (UImode == "floating") {
                    if (webVRController.hand == "left") {
                        if (stateObject.value > 0.01) {
                            messageUpdate("GUI SUMMONED");
                            var lookRay = VRHelper.webVRCamera.getForwardRay(2);
                            guiFloatPlaneMain.position = lookRay.origin.add(lookRay.direction.multiplyByFloats(lookRay.length, lookRay.length, lookRay.length));
                            guiFloatPlaneMain.lookAt(VRHelper.webVRCamera.position);

                        }
                    }
                }
            });

            //PRESS A Button -- HIDE SHOW GUI
            webVRController.onMainButtonStateChangedObservable.add((stateObject) => {
                if (webVRController.hand == "right") {
                    if (stateObject.value > 0.01) {
                        if (UImode == "hand") {
                            guiHandPlaneMain.isVisible = !guiHandPlaneMain.isVisible;
                            guiHandPlaneStatus.isVisible = !guiHandPlaneStatus.isVisible;
                            guiHandPlaneMenu.isVisible = !guiHandPlaneMenu.isVisible;
                        }
                        else if (UImode == "floating") {
                            guiFloatPlaneControls.isVisible = !guiFloatPlaneControls.isVisible;
                            guiFloatPlaneMenu.isVisible = !guiFloatPlaneMenu.isVisible;
                            guiFloatPlaneStatus.isVisible = !guiFloatPlaneStatus.isVisible;
                        }


                    }
                }
                
            });


        });

        



        //--------------------------FULLSCREEN GUI---------------------------------
        //Fullscreen GUI Setup

        //--------Set UI MODE---- 
        var UImode = "hand";

        var advancedFullScreenTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");


        var modeSwitcherBut = GUI.Button.CreateSimpleButton("", "Switch GUI Mode");
        modeSwitcherBut.height = "20%";
        modeSwitcherBut.width = "40%";
        modeSwitcherBut.background = "white";
        modeSwitcherBut.color = "black";
        modeSwitcherBut.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
        modeSwitcherBut.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        modeSwitcherBut.fontSize = "25px";

        var modeIndContainer= new GUI.Container();
        modeIndContainer.background = "black";
        modeIndContainer.height = "80%";
        modeIndContainer.width = "40%";
        modeIndContainer.paddingTop = "60%";
        modeIndContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
        modeIndContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;


        var modeIndicator = new GUI.TextBlock();
        modeIndicator.color = "white";
        modeIndicator.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
        modeIndicator.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        modeIndicator.fontSize = "20px";
        modeIndicator.text = "Current Mode: " + UImode;

        //toggle UI modes  
        modeSwitcherBut.onPointerDownObservable.add(function () {
            if (UImode == "hand") {
                UImode = "floating";
                modeIndicator.text = "Current Mode: " + UImode;
            }
            else if (UImode == "floating") {
                UImode = "hand";
                modeIndicator.text = "Current Mode: " + UImode;
            }
        });

        advancedFullScreenTexture.addControl(modeSwitcherBut);
        modeIndContainer.addControl(modeIndicator);
        advancedFullScreenTexture.addControl(modeIndContainer);

        //Show/Hide Fullscreen UI when entering/Exiting VR
        VRHelper.onEnteringVRObservable.add(function () {
            modeSwitcherBut.isVisible = false;
            modeIndContainer.isVisible = false;
        });

        VRHelper.onExitingVRObservable.add(function () {
            modeSwitcherBut.isVisible = true;
            modeIndContainer.isVisible = true;
        });


        //------------------------VR GUI------------------------------------------------

        VRHelper.onEnteringVRObservable.add(function () { 

            //mode for Hand Attached GUI
            if (UImode == "hand") {

                guiFloatPlaneControls.isVisible = false;
                guiFloatPlaneMenu.isVisible = false;
                guiFloatPlaneStatus.isVisible = false;
                guiHandPlaneSummon.isVisible = false;

                guiHandPlaneMain.isVisible = true;
                guiHandPlaneMenu.isVisible = true;
                guiHandPlaneStatus.isVisible = true;
            
                var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(guiHandPlaneMain);
                var advancedStatusTexture = GUI.AdvancedDynamicTexture.CreateForMesh(guiHandPlaneStatus);
                var advancedMenuTexture = GUI.AdvancedDynamicTexture.CreateForMesh(guiHandPlaneMenu);

                //---Status Scrollbox

                var scrollViewer = new GUI.ScrollViewer("Status Box");
                scrollViewer.width = "100%";
                scrollViewer.height = "80%";
                scrollViewer.background = "black";
                scrollViewer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                scrollViewer.paddingLeft = "100px";

                //var tb = new GUI.TextBlock();
                tb.textWrapping = GUI.TextWrapping.WordWrap;
                tb.resizeToFit = true;
                tb.paddingTop = "8px";
                tb.paddingLeft = "30px";
                tb.paddingRight = "20px"
                tb.paddingBottom = "8px";
                tb.height = "100%";
                tb.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                tb.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                tb.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                tb.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                tb.color = "white";

                tb.text = "";

                tb.fontSize = "50px";

                scrollViewer.addControl(tb);
                advancedStatusTexture.addControl(scrollViewer);


                //---Mini Status Box
                var miniScrollViewer = new GUI.ScrollViewer("Status Box");
                miniScrollViewer.width = "100%";
                miniScrollViewer.height = "20%";
                miniScrollViewer.background = "black";
                miniScrollViewer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                miniScrollViewer.paddingLeft = "100px";


                //var tbMini = new GUI.TextBlock(); -- Now declared global so messages can be sent from anywhere 
                tbMini.textWrapping = GUI.TextWrapping.WordWrap;
                tbMini.resizeToFit = true;
                tbMini.paddingLeft = "30px";
                tbMini.paddingRight = "20px"
                tbMini.paddingTop = "8px";
                tbMini.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                tbMini.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                tbMini.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                tbMini.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                tbMini.color = "white";

                tbMini.text = "";

                tbMini.fontSize = "50px";

                miniScrollViewer.addControl(tbMini);
                advancedStatusTexture.addControl(miniScrollViewer);

                //--Status Box Expander Button
                scrollViewer.isVisible = false;
                var statusExpander = GUI.Button.CreateSimpleButton("", "Status");

                statusExpander.height = "10%";
                statusExpander.width = "100%";
                statusExpander.background = "white";
                statusExpander.color = "black";
                statusExpander.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                statusExpander.paddingBottom = "0px";
                statusExpander.paddingLeft = "100px";
                statusExpander.fontSize = "50px";


                advancedStatusTexture.addControl(statusExpander);

                statusExpander.onPointerUpObservable.add(function () {

                    if (scrollViewer.isVisible) {
                        scrollViewer.isVisible = false;
                        miniScrollViewer.isVisible = true;
                        //statusExpander.paddingBottom = "35px";
                        //statusExpander.height = "70px";
                    }
                    else if (!scrollViewer.isVisible) {
                        scrollViewer.isVisible = true;
                        miniScrollViewer.isVisible = false;
                        //statusExpander.paddingBottom = "190px";
                        //statusExpander.height = "225px";
                    }

                    //messageUpdate("Status Block Mode Switched", tb);
                });




                //---TOP MENU

                //Setup grey background behind top menu itmes
                var topBar = new GUI.Container();
                topBar.width = "100%";
                topBar.height = "40px";
                topBar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                topBar.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                //topBar.background = "grey";
                topBar.isHitTestVisible = false;
                advancedMenuTexture.addControl(topBar);

                var dropdownA = new Dropdown(advancedMenuTexture, "120px", "300px", "50px", "File", tb);
                //dropdownA.top = "10px"; 
                dropdownA.left = "100px";
                dropdownA.addOption("New", function () { messageUpdate("New Pressed"); });
                dropdownA.addOption("Load", function () { messageUpdate("Load Pressed"); });
                dropdownA.addOption("Save", function () { messageUpdate("Save Pressed"); });
                dropdownA.addOption("Quit", function () { messageUpdate("Quit Pressed"); });

                var dropdownB = new Dropdown(advancedMenuTexture, "120px", "300px", "50px", "View", tb);
                //dropdownB.top = "10px";
                dropdownB.left = "400px";
                dropdownB.addOption("Next", function () { messageUpdate("Next Pressed"); });
                dropdownB.addOption("Previous", function () { messageUpdate("Previous Pressed"); });

                var dropdownC = new Dropdown(advancedMenuTexture, "120px", "300px", "50px", "Edit", tb);
                //dropdownB.top = "10px";  
                dropdownC.left = "700px";

                //---Tool Palette

                var toolPalette = new GUI.Container();
                toolPalette.width = "300px";
                toolPalette.height = "100%";
                toolPalette.paddingTop = "240px";
                toolPalette.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                toolPalette.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

                //toolPalette.background = "white";
                toolPalette.isHitTestVisible = false;

                var paletteButColor = "black";
                var paletteButBackground = "white";
                var paletteButFontSize = "50px";
                var paletteButVertAlign = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                var paletteButHorzAlign = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

                var lineButton = GUI.Button.CreateSimpleButton("line", "Line");
                lineButton.height = "120px";
                lineButton.fontSize = paletteButFontSize;
                lineButton.color = paletteButColor;
                lineButton.background = paletteButBackground;
                lineButton.verticalAlignment = paletteButVertAlign;
                lineButton.horizontalAlignment = paletteButHorzAlign;
                lineButton.onPointerClickObservable.add(function () {
                    fsm.go(ToolSelection.Line);
                    //messageUpdate("Line Pressed");
                    //toolSelect(lineButton);
                });

                var penButton = GUI.Button.CreateSimpleButton("pen", "Pen");
                penButton.height = "240px";
                penButton.paddingTop = "120px";
                penButton.fontSize = paletteButFontSize;
                penButton.color = paletteButColor;
                penButton.background = paletteButBackground;
                penButton.verticalAlignment = paletteButVertAlign;
                penButton.horizontalAlignment = paletteButHorzAlign;
                penButton.onPointerClickObservable.add(function () {
                    fsm.go(ToolSelection.Pen);
                    //messageUpdate("Pen Pressed");
                    //toolSelect(penButton);
                });



                var eraserButton = GUI.Button.CreateSimpleButton("eraser", "Eraser");
                eraserButton.height = "360px";
                eraserButton.paddingTop = "240px";
                eraserButton.fontSize = paletteButFontSize;
                eraserButton.color = paletteButColor;
                eraserButton.background = paletteButBackground;
                eraserButton.verticalAlignment = paletteButVertAlign;
                eraserButton.horizontalAlignment = paletteButHorzAlign;
                eraserButton.onPointerClickObservable.add(function () {
                    fsm.go(ToolSelection.Eraser);
                    //messageUpdate("Eraser Pressed");
                    //toolSelect(eraserButton);
                });


                var brushButton = GUI.Button.CreateSimpleButton("brush", "Brush");
                brushButton.height = "480px";
                brushButton.paddingTop = "360px";
                brushButton.fontSize = paletteButFontSize;
                brushButton.color = paletteButColor;
                brushButton.background = paletteButBackground;
                brushButton.verticalAlignment = paletteButVertAlign;
                brushButton.horizontalAlignment = paletteButHorzAlign;
                brushButton.onPointerClickObservable.add(function () {
                    messageUpdate("Brush Pressed");
                    togglePalette(brushPaletteContainer);
                });

                var colorsButton = GUI.Button.CreateSimpleButton("colors", "Colors");
                colorsButton.height = "600px";
                colorsButton.paddingTop = "480px";
                colorsButton.fontSize = paletteButFontSize;
                colorsButton.color = paletteButColor;
                colorsButton.background = paletteButBackground;
                colorsButton.verticalAlignment = paletteButVertAlign;
                colorsButton.horizontalAlignment = paletteButHorzAlign;
                colorsButton.onPointerClickObservable.add(function () {
                    messageUpdate("Colors Pressed");
                    togglePalette(colorsPaletteContainer);
                });

                var brushPaletteContainer = new GUI.Container();
                brushPaletteContainer.width = "800px";
                brushPaletteContainer.height = "100%";
                brushPaletteContainer.paddingTop = "220px";
                //brushPaletteContainer.paddingBottom = "180px";
                brushPaletteContainer.paddingLeft = "300px";
                brushPaletteContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                brushPaletteContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                //brushPaletteContainer.background = "grey";
                brushPaletteContainer.isHitTestVisible = false;
                brushPaletteContainer.isVisible = false;

                //various texture panels and textures

                //left column of textures
                var texturePanel1 = new GUI.StackPanel();
                texturePanel1.isVertical = true;
                texturePanel1.paddingLeft = "10px";
                //texturePanel1.paddingTop = "10px"; 
                //texturePanel1.paddingBottom = "10px"
                texturePanel1.width = "250px";
                texturePanel1.height = "100%";
                //texturePanel1.background = "white";
                texturePanel1.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                texturePanel1.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

                //right column of textures
                var texturePanel2 = new GUI.StackPanel();
                texturePanel2.isVertical = true;
                texturePanel2.paddingRight = "10px";
                //texturePanel2.paddingTop = "10px";
                //texturePanel2.paddingBottom = "10px"
                texturePanel2.width = "250px";
                texturePanel2.height = "100%";
                //texturePanel2.background = "blue"; 
                texturePanel2.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                texturePanel2.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;

                //textures left column 
                var bpTextureBut1 = new texturePictureButton("tb1", "textures/brushTexture.jpeg", bMaterial);
                var bpTextureBut2 = new texturePictureButton("tb2", "textures/blair.jpg", bMaterial);
                var bpTextureBut3 = new texturePictureButton("tb3", "textures/blair2.jpg", bMaterial);
                var bpTextureBut4 = new texturePictureButton("tb4", "textures/blair3.jpg", bMaterial);
                var bpTextureBut5 = new texturePictureButton("tb5", "textures/blair4.png", bMaterial);


                texturePanel1.addControl(bpTextureBut1.button);
                texturePanel1.addControl(bpTextureBut2.button);
                texturePanel1.addControl(bpTextureBut3.button);
                texturePanel1.addControl(bpTextureBut4.button);
                texturePanel1.addControl(bpTextureBut5.button);

                //textures right column
                var bpTextureBut6 = new texturePictureButton("tb6", "textures/brushTexture2.jpg", bMaterial);
                var bpTextureBut7 = new texturePictureButton("tb7", "textures/blair5.jpg", bMaterial);
                var bpTextureBut8 = new texturePictureButton("tb8", "textures/blair6.jpg", bMaterial);
                var bpTextureBut9 = new texturePictureButton("tb9", "textures/Dog-VR.jpg", bMaterial);
                var bpTextureBut10 = new texturePictureButton("tb10", "textures/oculus.png", bMaterial);

                texturePanel2.addControl(bpTextureBut6.button);
                texturePanel2.addControl(bpTextureBut7.button);
                texturePanel2.addControl(bpTextureBut8.button);
                texturePanel2.addControl(bpTextureBut9.button);
                texturePanel2.addControl(bpTextureBut10.button);

                brushPaletteContainer.addControl(texturePanel1);
                brushPaletteContainer.addControl(texturePanel2);


                var colorsPaletteContainer = new GUI.Container();
                colorsPaletteContainer.width = "800px";
                colorsPaletteContainer.height = "100%";
                colorsPaletteContainer.paddingTop = "240px";
                //colorsPaletteContainer.paddingBottom = "300px";
                colorsPaletteContainer.paddingLeft = "300px";
                colorsPaletteContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                colorsPaletteContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                //colorsPaletteContainer.background = "grey";
                colorsPaletteContainer.isHitTestVisible = false;
                colorsPaletteContainer.isVisible = false;

                var cPicker = new GUI.ColorPicker();
                cPicker.height = "450px";
                cPicker.width = "450px";
                cPicker.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

                cPicker.onValueChangedObservable.add(function (value) { // value is a color3
                    messageUpdate("Color Selected: " + value);
                    bMaterial.diffuseColor.copyFrom(value);
                });

                colorsPaletteContainer.addControl(cPicker);

                //contains all tools that can by toggled on and off - make sure to update if adding more tools in future  
                toolsArray = [lineButton, penButton, eraserButton];

                //contains all palettes that can by toggled on and off - make sure to update if adding more palettes in future  
                paletteArray = [brushPaletteContainer, colorsPaletteContainer];

                //contains all textures that can by toggled on and off - make sure to update if adding more textures in future
                texturesArray = [bpTextureBut1.button, bpTextureBut2.button, bpTextureBut3.button, bpTextureBut4.button, bpTextureBut5.button, bpTextureBut6.button, bpTextureBut7.button, bpTextureBut8.button, bpTextureBut9.button, bpTextureBut10.button];

                toolPalette.addControl(lineButton);
                toolPalette.addControl(penButton);
                toolPalette.addControl(eraserButton);
                toolPalette.addControl(brushButton);
                toolPalette.addControl(colorsButton);
                advancedTexture.addControl(brushPaletteContainer);
                advancedTexture.addControl(colorsPaletteContainer);
                advancedTexture.addControl(toolPalette);

                //----------Set initial texture/color
                textureSelect(bpTextureBut1.button, bMaterial, "textures/brushTexture.jpeg");
                cPicker.value = new Color3(1, 1, 1);


                //button1.onPointerUpObservable.add(function () {
                //    alert("you did it!");
                //});

            }

            //mode for floating GUI  
            else if (UImode == "floating") {

                guiFloatPlaneControls.isVisible = true;
                guiFloatPlaneMenu.isVisible = true;
                guiFloatPlaneStatus.isVisible = true;
                guiHandPlaneSummon.isVisible = true;

                guiHandPlaneMain.isVisible = false;
                guiHandPlaneMenu.isVisible = false;
                guiHandPlaneStatus.isVisible = false;

                var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(guiFloatPlaneControls);
                var advancedStatusTexture = GUI.AdvancedDynamicTexture.CreateForMesh(guiFloatPlaneStatus);
                var advancedMenuTexture = GUI.AdvancedDynamicTexture.CreateForMesh(guiFloatPlaneMenu);

            

                //-----------------Summon GUI Instructions On LeftHand
                var advancedSummonTexture = GUI.AdvancedDynamicTexture.CreateForMesh(guiHandPlaneSummon);
                var summonGUIMessage = GUI.Button.CreateSimpleButton("", "Press X to Summon GUI");
                summonGUIMessage.height = "20%";
                summonGUIMessage.width = "50%";
                summonGUIMessage.background = "black";
                summonGUIMessage.color = "white";
                summonGUIMessage.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                summonGUIMessage.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
                summonGUIMessage.paddingBottom = "0px";
                summonGUIMessage.paddingLeft = "100px";
                summonGUIMessage.fontSize = "50px";
                summonGUIMessage.isHitTestVisible = false;

                advancedSummonTexture.addControl(summonGUIMessage);

                //---------------------------

                //---Status Scrollbox

                var scrollViewer = new GUI.ScrollViewer("Status Box");
                scrollViewer.width = "100%";
                scrollViewer.height = "80%";
                scrollViewer.background = "black";
                scrollViewer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                scrollViewer.paddingLeft = "100px";

                //var tb = new GUI.TextBlock();
                tb.textWrapping = GUI.TextWrapping.WordWrap;
                tb.resizeToFit = true;
                tb.paddingTop = "8px";
                tb.paddingLeft = "30px";
                tb.paddingRight = "20px"
                tb.paddingBottom = "8px";
                tb.height = "100%";
                tb.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                tb.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                tb.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                tb.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                tb.color = "white";

                tb.text = "";

                tb.fontSize = "50px";

                scrollViewer.addControl(tb);
                advancedStatusTexture.addControl(scrollViewer);


                //---Mini Status Box
                var miniScrollViewer = new GUI.ScrollViewer("Status Box");
                miniScrollViewer.width = "100%";
                miniScrollViewer.height = "20%";
                miniScrollViewer.background = "black";
                miniScrollViewer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                miniScrollViewer.paddingLeft = "100px";


                //var tbMini = new GUI.TextBlock(); -- Now declared global so messages can be sent from anywhere 
                tbMini.textWrapping = GUI.TextWrapping.WordWrap;
                tbMini.resizeToFit = true;
                tbMini.paddingLeft = "30px";
                tbMini.paddingRight = "20px"
                tbMini.paddingTop = "8px";
                tbMini.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                tbMini.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                tbMini.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                tbMini.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                tbMini.color = "white";

                tbMini.text = "";

                tbMini.fontSize = "50px";

                miniScrollViewer.addControl(tbMini);
                advancedStatusTexture.addControl(miniScrollViewer);

                //--Status Box Expander Button
                scrollViewer.isVisible = false;
                var statusExpander = GUI.Button.CreateSimpleButton("", "Status");

                statusExpander.height = "10%";
                statusExpander.width = "100%";
                statusExpander.background = "white";
                statusExpander.color = "black";
                statusExpander.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                statusExpander.paddingBottom = "0px";
                statusExpander.paddingLeft = "100px";
                statusExpander.fontSize = "50px";


                advancedStatusTexture.addControl(statusExpander);

                statusExpander.onPointerUpObservable.add(function () {

                    if (scrollViewer.isVisible) {
                        scrollViewer.isVisible = false;
                        miniScrollViewer.isVisible = true;
                        //statusExpander.paddingBottom = "35px";
                        //statusExpander.height = "70px";
                    }
                    else if (!scrollViewer.isVisible) {
                        scrollViewer.isVisible = true;
                        miniScrollViewer.isVisible = false;
                        //statusExpander.paddingBottom = "190px";
                        //statusExpander.height = "225px";
                    }

                    //messageUpdate("Status Block Mode Switched", tb);
                });




                //---TOP MENU

                //Setup grey background behind top menu itmes
                var topBar = new GUI.Container();
                topBar.width = "100%";
                topBar.height = "40px";
                topBar.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                topBar.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                //topBar.background = "grey";
                topBar.isHitTestVisible = false;
                advancedMenuTexture.addControl(topBar);

                var dropdownA = new Dropdown(advancedMenuTexture, "150px", "300px", "50px", "File", tb);
                //dropdownA.top = "10px"; 
                dropdownA.left = "100px";
                dropdownA.addOption("New", function () { messageUpdate("New Pressed"); });
                dropdownA.addOption("Load", function () { messageUpdate("Load Pressed"); });
                dropdownA.addOption("Save", function () { messageUpdate("Save Pressed"); });
                dropdownA.addOption("Quit", function () { messageUpdate("Quit Pressed"); });

                var dropdownB = new Dropdown(advancedMenuTexture, "150px", "300px", "50px", "View", tb);
                //dropdownB.top = "10px";
                dropdownB.left = "400px";
                dropdownB.addOption("Next", function () { messageUpdate("Next Pressed"); });
                dropdownB.addOption("Previous", function () { messageUpdate("Previous Pressed"); });

                var dropdownC = new Dropdown(advancedMenuTexture, "150px", "300px", "50px", "Edit", tb);
                //dropdownB.top = "10px";  
                dropdownC.left = "700px";

                //---Tool Palette

                var toolPalette = new GUI.Container();
                toolPalette.width = "300px";
                toolPalette.height = "100%";
                toolPalette.paddingTop = "240px";
                toolPalette.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                toolPalette.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

                //toolPalette.background = "white";
                toolPalette.isHitTestVisible = false;

                var paletteButColor = "black";
                var paletteButBackground = "white";
                var paletteButFontSize = "50px";
                var paletteButVertAlign = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                var paletteButHorzAlign = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

                var lineButton = GUI.Button.CreateSimpleButton("line", "Line");
                lineButton.height = "120px";
                lineButton.fontSize = paletteButFontSize;
                lineButton.color = paletteButColor;
                lineButton.background = paletteButBackground;
                lineButton.verticalAlignment = paletteButVertAlign;
                lineButton.horizontalAlignment = paletteButHorzAlign;
                lineButton.onPointerClickObservable.add(function () {
                    fsm.go(ToolSelection.Line);
                    //messageUpdate("Line Pressed");
                    //toolSelect(lineButton);
                });

                var penButton = GUI.Button.CreateSimpleButton("pen", "Pen");
                penButton.height = "240px";
                penButton.paddingTop = "120px";
                penButton.fontSize = paletteButFontSize;
                penButton.color = paletteButColor;
                penButton.background = paletteButBackground;
                penButton.verticalAlignment = paletteButVertAlign;
                penButton.horizontalAlignment = paletteButHorzAlign;
                penButton.onPointerClickObservable.add(function () {
                    fsm.go(ToolSelection.Pen);
                    //messageUpdate("Pen Pressed");
                    //toolSelect(penButton);
                });



                var eraserButton = GUI.Button.CreateSimpleButton("eraser", "Eraser");
                eraserButton.height = "360px";
                eraserButton.paddingTop = "240px";
                eraserButton.fontSize = paletteButFontSize;
                eraserButton.color = paletteButColor;
                eraserButton.background = paletteButBackground;
                eraserButton.verticalAlignment = paletteButVertAlign;
                eraserButton.horizontalAlignment = paletteButHorzAlign;
                eraserButton.onPointerClickObservable.add(function () {
                    fsm.go(ToolSelection.Eraser);
                    //messageUpdate("Eraser Pressed");
                    //toolSelect(eraserButton);
                });


                var brushButton = GUI.Button.CreateSimpleButton("brush", "Brush");
                brushButton.height = "480px";
                brushButton.paddingTop = "360px";
                brushButton.fontSize = paletteButFontSize;
                brushButton.color = paletteButColor;
                brushButton.background = paletteButBackground;
                brushButton.verticalAlignment = paletteButVertAlign;
                brushButton.horizontalAlignment = paletteButHorzAlign;
                brushButton.onPointerClickObservable.add(function () {
                    messageUpdate("Brush Pressed");
                    togglePalette(brushPaletteContainer);
                });

                var colorsButton = GUI.Button.CreateSimpleButton("colors", "Colors");
                colorsButton.height = "600px";
                colorsButton.paddingTop = "480px";
                colorsButton.fontSize = paletteButFontSize;
                colorsButton.color = paletteButColor;
                colorsButton.background = paletteButBackground;
                colorsButton.verticalAlignment = paletteButVertAlign;
                colorsButton.horizontalAlignment = paletteButHorzAlign;
                colorsButton.onPointerClickObservable.add(function () {
                    messageUpdate("Colors Pressed");
                    togglePalette(colorsPaletteContainer);
                });

                var brushPaletteContainer = new GUI.Container();
                brushPaletteContainer.width = "800px";
                brushPaletteContainer.height = "100%";
                brushPaletteContainer.paddingTop = "220px";
                //brushPaletteContainer.paddingBottom = "180px";
                brushPaletteContainer.paddingLeft = "300px";
                brushPaletteContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                brushPaletteContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                //brushPaletteContainer.background = "grey";
                brushPaletteContainer.isHitTestVisible = false;
                brushPaletteContainer.isVisible = false;

                //various texture panels and textures

                //left column of textures
                var texturePanel1 = new GUI.StackPanel();
                texturePanel1.isVertical = true;
                texturePanel1.paddingLeft = "10px";
                //texturePanel1.paddingTop = "10px"; 
                //texturePanel1.paddingBottom = "10px"
                texturePanel1.width = "250px";
                texturePanel1.height = "100%";
                //texturePanel1.background = "white";
                texturePanel1.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                texturePanel1.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

                //right column of textures
                var texturePanel2 = new GUI.StackPanel();
                texturePanel2.isVertical = true;
                texturePanel2.paddingRight = "10px";
                //texturePanel2.paddingTop = "10px";
                //texturePanel2.paddingBottom = "10px"
                texturePanel2.width = "250px";
                texturePanel2.height = "100%";
                //texturePanel2.background = "blue"; 
                texturePanel2.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                texturePanel2.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;

                //textures left column 
                var bpTextureBut1 = new texturePictureButton("tb1", "textures/brushTexture.jpeg", bMaterial);
                var bpTextureBut2 = new texturePictureButton("tb2", "textures/blair.jpg", bMaterial);
                var bpTextureBut3 = new texturePictureButton("tb3", "textures/blair2.jpg", bMaterial);
                var bpTextureBut4 = new texturePictureButton("tb4", "textures/blair3.jpg", bMaterial);
                var bpTextureBut5 = new texturePictureButton("tb5", "textures/blair4.png", bMaterial);


                texturePanel1.addControl(bpTextureBut1.button);
                texturePanel1.addControl(bpTextureBut2.button);
                texturePanel1.addControl(bpTextureBut3.button);
                texturePanel1.addControl(bpTextureBut4.button);
                texturePanel1.addControl(bpTextureBut5.button);

                //textures right column
                var bpTextureBut6 = new texturePictureButton("tb6", "textures/brushTexture2.jpg", bMaterial);
                var bpTextureBut7 = new texturePictureButton("tb7", "textures/blair5.jpg", bMaterial);
                var bpTextureBut8 = new texturePictureButton("tb8", "textures/blair6.jpg", bMaterial);
                var bpTextureBut9 = new texturePictureButton("tb9", "textures/Dog-VR.jpg", bMaterial);
                var bpTextureBut10 = new texturePictureButton("tb10", "textures/oculus.png", bMaterial);

                //var textureImages: String[] = [
                //    "textures/brushTexture.jpeg",
                //    "textures/blair.jpg",
                //    "textures/blair2.jpg",
                //    "textures/blair3.jpg",
                //    "textures/blair4.png",
                //    "textures/brushTexture2.jpg",
                //    "textures/blair5.jpg",
                //    "textures/blair6.jpg",
                //    "textures/Dog-VR.jpg",
                //    "textures/oculus.png",
                //]; 

                texturePanel2.addControl(bpTextureBut6.button);
                texturePanel2.addControl(bpTextureBut7.button);
                texturePanel2.addControl(bpTextureBut8.button);
                texturePanel2.addControl(bpTextureBut9.button);
                texturePanel2.addControl(bpTextureBut10.button);

                brushPaletteContainer.addControl(texturePanel1);
                brushPaletteContainer.addControl(texturePanel2);


                var colorsPaletteContainer = new GUI.Container();
                colorsPaletteContainer.width = "800px";
                colorsPaletteContainer.height = "100%";
                colorsPaletteContainer.paddingTop = "240px";
                //colorsPaletteContainer.paddingBottom = "300px";
                colorsPaletteContainer.paddingLeft = "300px";
                colorsPaletteContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                colorsPaletteContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                //colorsPaletteContainer.background = "grey";
                colorsPaletteContainer.isHitTestVisible = false;
                colorsPaletteContainer.isVisible = false;

                var cPicker = new GUI.ColorPicker();
                cPicker.height = "450px";
                cPicker.width = "450px";
                cPicker.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

                cPicker.onValueChangedObservable.add(function (value) { // value is a color3
                    messageUpdate("Color Selected: " + value);
                    bMaterial.diffuseColor.copyFrom(value);
                });

                colorsPaletteContainer.addControl(cPicker);

                //contains all tools that can by toggled on and off - make sure to update if adding more tools in future  
                toolsArray = [lineButton, penButton, eraserButton];

                //contains all palettes that can by toggled on and off - make sure to update if adding more palettes in future  
                paletteArray = [brushPaletteContainer, colorsPaletteContainer];

                //contains all textures that can by toggled on and off - make sure to update if adding more textures in future
                texturesArray = [bpTextureBut1.button, bpTextureBut2.button, bpTextureBut3.button, bpTextureBut4.button, bpTextureBut5.button, bpTextureBut6.button, bpTextureBut7.button, bpTextureBut8.button, bpTextureBut9.button, bpTextureBut10.button];

                toolPalette.addControl(lineButton);
                toolPalette.addControl(penButton);
                toolPalette.addControl(eraserButton);
                toolPalette.addControl(brushButton);
                toolPalette.addControl(colorsButton);
                advancedTexture.addControl(brushPaletteContainer);
                advancedTexture.addControl(colorsPaletteContainer);
                advancedTexture.addControl(toolPalette);


                //button1.onPointerUpObservable.add(function () {
                //    alert("you did it!");
                //});

                //----------Set initial texture/color 
                textureSelect(bpTextureBut1.button, bMaterial, "textures/brushTexture.jpeg");
                cPicker.value = new Color3(1,1,1);


            }


            //----------FSM Listeners and Functions


            // Listen for transitions, if the callback returns false the transition is canceled.

            fsm.onEnter(ToolSelection.Pen, () => {
                messageUpdate("Pen Pressed");
                toolSelect(penButton);
                return true;
            });

            fsm.onEnter(ToolSelection.Line, () => {
                messageUpdate("Line Pressed");
                toolSelect(lineButton);
                return true;
            });

            fsm.onEnter(ToolSelection.Eraser, () => {
                messageUpdate("Eraser Pressed");
                toolSelect(eraserButton);

                return true;
            });

        

            //----------Right Hand ToolTips

            //HideShow Tooltip
            var advancedToggleTexture = GUI.AdvancedDynamicTexture.CreateForMesh(guiHandPlaneToggle);
            var toggleGUITooltip = GUI.Button.CreateSimpleButton("", "Press A to Hide/Show GUI");
            toggleGUITooltip.height = "20%";
            toggleGUITooltip.width = "50%";
            toggleGUITooltip.background = "black";
            toggleGUITooltip.color = "white";
            toggleGUITooltip.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            toggleGUITooltip.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            toggleGUITooltip.paddingBottom = "0px";
            toggleGUITooltip.paddingLeft = "100px";
            toggleGUITooltip.fontSize = "50px";
            toggleGUITooltip.isHitTestVisible = false;

            advancedToggleTexture.addControl(toggleGUITooltip);

            //Trigger Function Tooltip
            var advancedTriggerInstructionsTexture = GUI.AdvancedDynamicTexture.CreateForMesh(guiHandPlaneTriggerInst); 
            var triggerGUITooltip = GUI.Button.CreateSimpleButton("", "To Draw/Erase, partially depress trigger with tool selected");
            triggerGUITooltip.height = "40%";
            triggerGUITooltip.width = "50%";
            triggerGUITooltip.background = "black";
            triggerGUITooltip.color = "white";
            triggerGUITooltip.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            triggerGUITooltip.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            triggerGUITooltip.paddingBottom = "0px";
            triggerGUITooltip.paddingLeft = "100px";
            triggerGUITooltip.fontSize = "50px";
            triggerGUITooltip.isHitTestVisible = false;

            advancedTriggerInstructionsTexture.addControl(triggerGUITooltip);

        });

        return scene;

    }
}



//Open-Close Brush Palette 
function togglePalette (selectedPalette: GUI.Container) {


    for (var i = 0; i < paletteArray.length; i++) {

        if (paletteArray[i] == selectedPalette) {
            paletteArray[i].isVisible = !paletteArray[i].isVisible;
        }
        else {
            paletteArray[i].isVisible = false;
        }

        
    }
}

//Tool Select  
function toolSelect(selectedTool: GUI.Button) {
    //toolsArray is a global variable


    for (var i = 0; i < toolsArray.length; i++) {
        toolsArray[i].background = "white";
    }

    selectedTool.background = "grey";

    //Future implement tool actions in here

}

//Update the status box with messages called from various places
function messageUpdate(message: string) { // used to have parameter, but moved to global textBlock: GUI.TextBlock
    messageQueue.push(message);

    while (messageQueue.length > 20) { //20 Lines is the current maximum for messages stored in the Queue, can expand to more
        messageQueue.shift();
    }

    tb.text = "";
    tbMini.text = "";


    for (var i = 1; i <= messageQueue.length; i++) {
        tb.text += messageQueue[messageQueue.length - i] + "\n";
    }

    tbMini.text = messageQueue[messageQueue.length - 1];
}

function textureSelect(selectedTexture: GUI.Button, materialToUpdate: StandardMaterial, imgString: string) {
    for (var i = 0; i < texturesArray.length; i++) {
        texturesArray[i].color = "white";
        texturesArray[i].thickness = 1;
    }
    selectedTexture.color = "red";
    selectedTexture.thickness = 3;

    materialToUpdate.diffuseTexture = new Texture(imgString, scene);

}

//TexturePic Class
class texturePictureButton
{
    button: GUI.Button;

    constructor(name: string, image: string, globalMat: StandardMaterial)
    {
        this.button = GUI.Button.CreateImageOnlyButton(name, image);
        this.button.width = "150px";
        this.button.height = "150px";
        this.button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.button.paddingTop = "20px";

        //FUTURE IMPLEMENTATION - CHANGE COLOR AND THICKNESS TO SELECT 
        //this.button.color = "black";
        //this.button.thickness = 1;

        this.button.onPointerUpObservable.add(() => {

            textureSelect(this.button, globalMat, image);

            var message = name + " Selected";
            messageUpdate(message);
        });
    }


}


////Dropdown class from Babylon GUI example with modifications to make it TypeScript compatible
class Dropdown
{
    height: string;
    width: string;
    color: string;
    background: string;
    fontSize: string;
    advancedTexture: GUI.AdvancedDynamicTexture;
    container: GUI.Container;
    button: GUI.Button;
    options: GUI.StackPanel;

    constructor(advancedTexture: GUI.AdvancedDynamicTexture, height: string, width: string, fontSize: string, name: string, textBlock: GUI.TextBlock)
    {
        // Members
        this.height = height;
        this.width = width;
        this.fontSize = fontSize;
        this.color = "black";
        this.background = "white";

        this.advancedTexture = advancedTexture;

        // Container
        this.container = new GUI.Container();
        this.container.width = this.width;
        this.container.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.container.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.container.isHitTestVisible = false;
        
        // Primary button  
        this.button = GUI.Button.CreateSimpleButton("", name);
        this.button.height = this.height;
        this.button.background = this.background;
        this.button.color = this.color;
        this.button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.button.fontSize = this.fontSize;

        // Options panel
        this.options = new GUI.StackPanel();
        this.options.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.options.top = this.height;
        this.options.isVisible = false;
        this.options.isVertical = true;

        var _this = this;
        this.button.onPointerUpObservable.add(function() {
            _this.options.isVisible = !_this.options.isVisible;

            var message = name + " Pressed";
            messageUpdate(message);
        });

        //custom hack to make dropdown visible;
        this.container.onPointerEnterObservable.add(function(){
            _this.container.zIndex = 555; //some big value            
        });

        this.container.onPointerOutObservable.add(function(){
            _this.container.zIndex = 0; //back to original            
        });

        // add controls
        this.advancedTexture.addControl(this.container);
        this.container.addControl(this.button);
        this.container.addControl(this.options);        
    }

    get top() {
        return this.container.top;
    }

    set top(value) {
       this.container.top = value;     
    }

    get left() {
        return this.container.left;
    }

    set left(value) {
       this.container.left = value;     
    } 

    addOption(text: string, callback: (eventData: GUI.Vector2WithInfo, eventState: EventState) => void)
    {
        var button = GUI.Button.CreateSimpleButton(text, text);
        button.height = this.height;
        button.paddingTop = "-1px";
        button.background = this.background;
        button.color = this.color;
        button.alpha = 1.0;
        button.fontSize = this.fontSize;
        button.onPointerUpObservable.add(() => {
            this.options.isVisible = false;            
        });        
        button.onPointerClickObservable.add(callback); 
        this.options.addControl(button);

    }
};



/******* End of the create scene function ******/    
// code to use the Class above
var createScene = function() { 
    return Playground.CreateScene(engine, 
        engine.getRenderingCanvas() as HTMLCanvasElement); 
}

var scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () { 
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () { 
    engine.resize();
});


