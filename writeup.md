# Reflections on Immersive 3D UI implementations
Writeup (4 pts)
Justify choices for each of the UI implementations (1 pt)
discuss the pros and cons of each of the two approaches you chose (1 pt)
discuss what worked and what didn't work as well as you liked (1 pt)
reflect on what you would do next with this UI if you had more time (1 pt)


For this assignment I implemented the GUIs in two ways:
1.) As a series of planes attached to the left hand controller
2.) As a floating plane that can be summoned to you with a controller button press

Although there are many differences between the modes, they both share the same three main components - Menu Bar, Toolbar, and Status box. Although they are arranged differently in each UI, the components visually look almost the same across implementations. I chose to do this to leverage as much as possible from Assignment A1 so I could focus more energy into the new part of the project, but also as an experiment to test and see how I could keep the same sort of interface viable across multiple styles of GUI. 

The biggest visual difference between the two UIs is the arrangement of the components. I felt with the hand based GUI I was more restricted to arrange components so that they would visually balance around the controller without overlapping other components. For example I chose to put the status bar on the lower right hand side of the controller (due to its greater functional use during actual drawing) and the menu bar on the lower left hand side (accesible, but out of the way). The menu bar drops down from the top and the status bar raises up from the bottom, so at first it might seem a strange orientation, however when both are opened, they take up about the same vertical space and create a balanced effect. I also chose to keep the main tool bar front and center above the controller as this is the primary interaction point for the program.

For the floating GUI, I found it was easier to arrange things in a more traditional UI format, but had to keep in mind not to block or take up too much of the user's view. Again I kept the secondary items in less prominent placing, this time off to the left side, with the menu and status bars in vertical allignment and the tool bar more focused towards the right. As I'm writing this I'm realizing how much this UI is VERY biased towards right handed people, and in fact the hand mounted GUI probably is the same as the menu floats above the left hand and forces you to draw with your right hand. 

I think both methods have pros and cons, the hand based gui is always going to be conveniently located, and can easily be moved in and out of view without thought. It more closesly matches the real world metaphor of a paint palette and I think people would find that very intuitive for this sort of application. The downside is that you will have to constantly raise and lower your arm to bring the UI into view. The floating GUI removes this issue by staying in place one summoned, however, it's easy for the position to become inconvenient as you move paint in new locations so it would really be situation dependent on if it is better. In addition, summoning it to the exact spot you want is based on your gaze and could be a little more intuitive with more polish on the interaction. As it stands now, getting the floating GUI exactly where you want takes a bit of fiddling. I think ideally giving the user an on the fly way to switch between menus could provide the best of both worlds.

I think this assignment proved to be a lot more challenging than I initially expected. Certain things were easy, for example the hand based GUI was fairly intuitive to implement and simply a matter of arranging three planes as children elements around a controller (although it took a LOT of fiddling and refreshing to get it right with weird rotation vectors and scaling hard to envision without trial and error). I think the floating GUI proved a lot more difficult to implement technically, as you had to gather information such as rays for the gaze direction and move planes to a spot a certain distance out on that ray and then arrange them to always face the user. This was a lot less intuitive and took a lot of digging through Babylon methods to figure out how to do it. On the other hand the arranging of the three components was exponentially simpler in this part. 

I faced a lot of challenges with setting colors and textures on the drawn objects, and as it stands I'm basically creating a new Babylon material for every single object that is spawned in. It's hardly efficient and I'm sure there are better ways to do it, but given time constraints and priorities this didn't get solved this iteration. Another big challenge was figuring out how to allow a user to draw and still interact with menus since they use the same button. At first every time I would instantiate an object it would immediately block the ray and prevent access to the GUI, but eventually I solved this by giving a slight offset on object creation. This was definitely a thing I didn't consider beforehand. One thing that did work well was the FSM. I followed the tips in class to use an FSM library and it worked perfectly. I am really grateful that suggestion was made in class.

I had a fair amount of trouble with the controller inputs. At first it was going crazy with capacitive touch rather than button presses until I found one example code that said to use (stateObject.value > 0.01) for button presses. However, one final challenge I wasn't able to overcome was with the TriggerStateChangeObservable, it doesn't work if the button is being held down all the way as the state is not changing. So drawing/object creation/erasing only works if the trigger is slightly depressed rather than all the way. The best solution I came up with was adding another tooltip to the right hand controller to explain this. OH and I did find adding tooltips to the controllers to be a useful design decision for anyone that wouldn't want to just fiddle with every button.

I sort of already mentioned these, but some of the things that I would do with this if I had more time:
-Provide left handed support to flip GUI
-Optimize material generation
-Refactor the code into smaller files for easier readability - as of now it's just one massive ugly Index.ts file
-Give the user a way to switch between the GUI modes in game
-Fix the trigger so that it draws continuously when held down

Overall, I would say this was a very challenging and time intensive assignment, but I definitely learned a lot in executing it.




