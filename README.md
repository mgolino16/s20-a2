# Assignment 2: An Immersive Babylon GUI

This is an INDIVIDUAL assignment.
 
## Due: Monday Feb 24th, 11:59pm

## Name and GT user-id

Name: 
User ID:

## Rubric

Graded out of 20.

- UI implementations (6 x 2)
  - Technique for summoning / dismissing menus  (1 pt)
  - Layout (2 pts)
  - Interaction (2 pts)
  - Overall feel of the UI (1+ pts).  High quality can result in > 1 pt.
- Create boxes and spheres as appropriate (2 pts)
- Erase boxes and spheres as appropriate (2 pts)
- Writeup (4 pts)
  - Justify choices for each of the UI implementations (1 pt)
  - discuss the pros and cons of each of the two approaches you chose (1 pt)
  - discuss what worked and what didn't work as well as you liked (1 pt)
  - reflect on what you would do next with this UI if you had more time (1 pt)

## Objective

In this homework assignment, we want to move the desktop, flat-screen UI from [assigment 1](https://github.com/3dui-class/s20-a0) into 3D in VR.

You should implement exactly the same set of interface components as A1, except now the elements will be placed in 3D VR space.  You will implement 2 versions of the 3D UI, and write a short reflection on the pros and cons of each, and the difficulties and challenges you encountered during your implementation.

PLEASE NOTE: Unlike A1, you are allowed to use the Bablyon GUI xml file specification or other tools to help you lay out the components. Since you already have the basic components arranged in UIs at this point, this may not be necessary. but you are free to use these tools if you want.

PLEASE NOTE: As with A1, all of the UI elements should be done with Babylon.  Do not try to use any HTML/CSS elements for your UI, since they do not work in VR.

If you're unsure about the tools you're using, check with us first.

## Description

During the three non-project assignments this semester, we will be creating an interactive 3D drawing program. Each homework assignment will build on the previous one, focusing on different aspects of the 3D interface. Please note that since this will be a continuing assignment that we'll build on in successive parts throughout the semester, it's important not to fall behind! 

In this second homework we'll take the basic application created in A1, using existing Babylon GUI components, and move it to VR. You'll get experience working with the component hierarchy in full immersive 3D, managing layout in 3D, and thinking about the issues with creating immersive UIs.

## Multiple ways to display menus in Immersive 3D

When using a 2D screen for a 3D UI, the menus and many interactions are best implemented in the 2D plane of the screen (i.e., as a 2D interface, as we did in A1).  In immersive AR and VR, there is no 2D screen on which to place menus and controls.

Immersive applications have tried many approaches over the years.  We will focus here on 2D interaction elements (e.g., buttons, color palettes, menus) of the sort we implemented in A1. Here are two examples, one of the flat plane containing UI elements (from No Man's Sky) and one of elements attached to a controller (in A-Painter):

![A Flat UI in No Man's Sky](/images/no-mans-sky.png)

![2D elements attached to a controller in A-Painter](/images/apainter.png)

Some examples of possible ways of laying out these 2D widgets in 3D include:

1. arrange them on a plane fixed in space (only appropriate if the working area is small, so not appropriate in this assignment) 
2. arrange them on a plane position in front of the user, summoned via some user action (e.g., pressing a button on a controller, or selecting a virtual button located in 3D)  (Babylon provides helpers for this)
3. similar, but have the plane move to remain in the user's view as they look around.  Typically, this sort of "follow the user's gaze" behavior has some kind of latency so as to appear stable.  So, if the 2D plane is in view, but not centered, it will not reposition.  If it is mostly out of view for some time interval, it slides into view.  And so forth.
3. arrange them similarly on a curved surface (cylindrical or spherical).  (Babylon provides helpers for this)
4. arrange them on the floor around the user's feet, either continuously or when summoned.
5. arrange them on a 3D object (e.g., cube, series of planes) attached to the users hand, arm, or controller. Typically, the menus would be attached to one side and the controller or fingers on the other hand would interact with them.  The different parts of the menu might be accessed by physically rotating the controller/hand/arm, or by using buttons or gestures on that controller/hand to rotate or cycle through different parts of the UI

For this assignment, you will pick two different approaches, implement them, and reflect on the differences.  If you want to try something not listed here, please check with the instructor.

You should pick two approaches that are not similar.  For example, positioning content on a plane and a cylinder near the user is not different enough.  

## Interface Layout and Controls

You should take your implementation of A1, and add the [WebXR Experience Helpers](https://doc.babylonjs.com/how_to/webxr_experience_helpers#exiting-xr) to support entering/exiting WebXR mode, and providing support for the XR camera, pointers, teleportation, and so on.

You should add a simple UI to the main 2D web page to select between your two immersive menu implementations before entering immersive mode.  You do not need to support switching between the two implementations in immersive mode.  You may implement this as you desire.  You might implement these as entirely different web pages, with the initial "menu" being a link to each page.  You might implement these as a single page, where the menu sets a flag and causes different menu code to run when you enter immersive mode.  Whichever you prefer is fine. 

You can leave the GUI from A1 visible in non-XR mode and restructure it in immersive mode, or remove it and only show the menus in immersive mode.

1. The menu bar will very likely have to change, for some of the implementations.  You are free to decide on how best to display the same set of menu items.

2. The status bar should be included and have similar functionality, but (again) can be arranged as appropriate.  The key is that you can see a condensed (single line) version and expand it to see more. 

3. A tool palette, and sub-palettes (brush menu and color picker) can be arranged as you desire in your UI.

## Interactivity

Your application should create a cube (line tool) or sphere (pen tool) at the tip fo the controller when the trigger is pressed.  The cube should be a reasonable, but small, size (e.g., 2-5cm across, as you desire) (If you implemented brush size for A1, or want to implement it now, you can use that to size the cubes and spheres).  It should have the color and texture currently selected in the UI.  When the eraser is selected, and the button is pressed, any cube or sphere that the tip of the controller is in should be deleted.   (This will require you to keep a list of all the cubes and spheres you have created, and check the position of the controller against each one when the button is pressed.)

You will have to pick some way to summon the menus and dismiss them. You could dedicate a controller button to it.  You could have an initial small set of buttons on one of the controllers that summon the full menus when clicked.  Think about what you would like to use.

To interact with the elements, you should consider the options of how to interact with the elements. You have different techniques you can use, including shooting a ray from the controller, using virtual touch controls with the tip of the controller, using the joysticks on the controllers, or some combination of these. 

Beyond this basic functionality, you should focus on making the menu implementations as pleasant to use as possible. Think carefully about size, how they behave, where they appear relative to the user's viewpoint, etc.  

You should try to reuse the UI elements from A1 as much as possible, rearranging and restructuring them as necessary.

## Writeup

Put your writeup in [writeup.md](writeup.md) and include it with your submission.

The requirements for what we want to see are listed in the rubric.  If you have questions, please ask on the Teams Assignment2 channel, so that everyone can benefit from the answers.

## Extra Credit

We are not providing specific ideas for extra credit on this assignment, beyond the potential bonus for very high quality "feel" of the implementation. 

If you have other ideas for extra credit, please ask in the Assignment2 channel on Teams, and we can discuss it.   (I would like such discussions to be public in the class, so that everyone has the same opportunities.)

## Submission

You will check out the project from github classroom, and submit it there.  The skeleton project is similar to A0, but you do not need to use any of it;  it is just provided as a starting point.  

The project folder should contain just the additions to the sample project that are needed to implement the project.  Do not add extra files or media you are not using, and do not remove the .gitignore file (we do not want the "node_modules" directory in your repository.)

**Do Not Change the names** of the main existing files (e.g., index.html and src/index.ts).  The TAs need to be able to test your program as follows:

1. cd into the directory and run ```npm install```
2. start a local web server and compile by running ```npm run start``` and pointing the browser at your ```index.html```

Please test that your submission meets these requirements.  For example, after you check in your final version of the assignment to github, check it out again to a new directory and make sure everything builds and runs correctly.
 
## Development Environment

The sample has been set up with a similar project for Typescript development as A0.

## Running 

You set up the initial project by pulling the dependencies from npm with 
```
npm install
```

After that, you can compile and run a server with:
```
npm run start
```

You do not have to run ```tsc``` to build the .js files from the .ts files;  ```npx``` builds them on the fly as part of running webpack.

You can run the sample by pointing your web browser at ```https://localhost:8080/index.html```

## License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">Material for 3D User Interfaces Spring 2020</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://github.blairmacintyre.me/cs3451-f19" property="cc:attributionName" rel="cc:attributionURL">Blair MacIntyre</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.

The intent of choosing (CC BY-NC-SA 4.0) is to allow individuals and instructors at non-profit entities to use this content.  This includes not-for-profit schools (K-12 and post-secondary). For-profit entities (or people creating courses for those sites) may not use this content without permission (this includes, but is not limited to, for-profit schools and universities and commercial education sites such as Corsera, Udacity, LinkedIn Learning, and other similar sites).