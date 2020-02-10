# Assignment 1: A Basic Flat-Screen Babylon GUI

This is an INDIVIDUAL assignment.
 
## Due: Friday Feb 7th, 11:59pm

## Name and GT user-id

Name: 
User ID:

## Rubric

Graded out of 20.

- Menu bar.  4
- Palette. 4
- Status bar. 4
- Default content area and general overall polished appearance content and UI. 4 
- Proper resize handling (position, size) of menu, palette, status area. 4

## Objective

In this homework assignment, we want you to become familiar with the basics of using Babylon's GUI classes to create a 3D GUI interface. You'll be assembling already provided components to create a user interface for a simple application.

Future assignments will build on this first assignment, so it's important for you to get this one right and to understand what you have done.

PLEASE NOTE: You are NOT allowed to use the Bablyon GUI xml file specification, or any other tools to help you lay out the components. The reason is that this assignment is designed to get you up-to-speed by writing some basic Babylon GUI code; if you're using some of the automation, you're not getting that practice.

PLEASE NOTE: All of the UI elements should be done with Babylon.  Do NOT use any HTML/CSS elements for your UI.

If you're unsure about the tools you're using, check with us first.

## Description

During the three non-project assignments this semester, we will be creating an interactive 3D drawing program. Each homework assignment will build on the previous one, focusing on different aspects of the 3D interface. Please note that since this will be a continuing assignment that we'll build on in successive parts throughout the semester, it's important not to fall behind!  (Note: exactly what the next two assignments focus on will depend on if/when we get our VR hardware.)

In this first homework we'll create a basic application, using existing Babylon GUI components. You'll get experience working with the component hierarchy, doing layout, and writing event-driven code in the form of Listeners.

## Basic Interface Layout

Your application will create a 3D canvas when it starts. Inside this canvas will be several main areas:

1. A menu bar across the top of the canvas. Use the ```AdvancedDynamicTexture.CreateFullscreenUI``` UI to create a full screen overlay, and then add a region to the top to serve as a menu bar. You should have three top-level menu items: File, Edit, and View. Under the File menu should be menu items for New, Load, Save, and Quit. Under the View menu should be menu items for Next and Previous. The Edit menu can be empty for now (in other words, it will appear on the menu bar but will have nothing selectable under it). For an example of how to create a drop down menu using Babylon's GUI, see examples such as [this](https://www.babylonjs-playground.com/#H10NI4#5) Playground example.

2. A main content area. Create a reasonable 3D environment such as the one created by ```createDefaultEnvironment```.  In the next assignment, this is where drawn content will go, but for now it will just appear as a mostly-empty space. This content area should take up most of the area of the canvas of your application.

3. A status bar at the bottom of the window. This will be a scrollable text area that spans the width of the window, and which will be used for debugging messages and other informative text content. The text area should have a narrow region at the top (akin to a title bar) and the following behavior:
  - normally, one line of text and the top border bar are visible. Clicking on the top border bar causes the window to expand up to show the full scrollable region. 
  - clicking on the bar again causes it to slide down and only show one line.
  - pick a large-yet-reasonable maximum size of the status text area (either lines or bytes), and when new messages are added, remove old content that exceeds this threshold.

4. A tool palette along the left edge of the window. This is where the drawing controls will go for your application. For now, you'll need to add the following buttons to the tool palette:

- Line tool
- Pen tool
- Eraser tool
- Brush Menu 
- Color Picker

These should be arranged in one column in the tool palette. One of Line, Pen, and Eraser should always be selected.  Clicking on the Brush Menu causes a brush palette to slide out from under the tool palette.  Is should be the same height as the tool palette, and have at least two columns of texture images that represent different kinds and textures of brushes (use any images you like.)  The Color Picker should slide the Babylon Color Picker out from under the tool palette.  Clicking either button again hides the palette, and clicking one when the other is open first hides the open one and then slides out the selected one. 

## Interactivity

Your application doesn't need to be able to draw anything yet. But it still will have some key pieces of interactivity; we'll fill in the rest in the second homework. The things your application needs to do at this point are mostly provided by Babylon, but you should ensure they are correctly working:

- Button feedback. Clicking on any of the buttons in the tool palette should display a status message in the text area, indicating what was pressed (e.g., the status bar should show "Pen tool clicked" or some such). Note that the first three buttons in the tool palette should be modal. This means that once a button is clicked, it stays in the "pressed" state until another button is clicked.
- Menu feedback. When any menu item is clicked, it should similarly display a text message in the status area.
-  Resizing. The application should behave "reasonably" when it's resized. Note that it's hard to describe every aspect of good resize behavior, but in general your application should behave like normal, commercial applications: the tool palette should be just wide enough to contain the tool buttons in it, and not get larger or smaller as the window is resized; the tool buttons themselves shouldn't spread out or get bigger or smaller as the window is resized. The status bar label should only grow and shrink horizontally, not vertically.       

## Extra Credit

In this and future assignments we'll suggest some ways you can earn extra credit on the project.  You can get a maximum of 10% of the value of the assignment extra.

Some possibilities for this assignment (each worth 1/20) are:

- Add a "brush size" palette, that has a slider and numeric text area to adjust the brush width. It should display the current brush texture, and stretch the width of the texture using a slider of some form.
- Add some simple content.  When you click on the ground plane in the default environment, it should add a random object (cube, sphere, etc) with a random size, decorated with the current brush texture and color.

If you have other ideas for extra credit, please ask in the Assignment1 channel on Teams, and we can discuss it.  
(I would like such discussions to be public in the class, so that everyone has the same opportunities.)

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