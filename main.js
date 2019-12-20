/*======================================================================
| Project:  Simple Point-Region Quadtree Demonstration
| Author:   Steven Eiselen, University of Arizona
| Language: Javascript with P5JS Library
+-----------------------------------------------------------------------
| Description:  Implementation of a Point-Region Quadtree which includes
|               interactive mouse-click placement and removal of points 
|               therein and corresponding dynamic visualization thereof.
| Instructions: LEFT  click in canvas -> Inserts Point at mouse position
|               RIGHT click in canvas -> Removes Point at mouse position
| Dependencies: This project should be composed of three files:
|               - index.html  (html 'launcher', including P5JS include)
|               - main.js     (this file, contains 'setup' and UI code)
|               - quadtree.js (contains project implementation code)
+-----------------------------------------------------------------------
| Implementation Notes:
|  > On modifying 'size': If modification of 'size' variable (i.e. pixel
|    length/width of quadtree area) is desired: powers of two should be
|    used for best results, else values that divide iteratively well by
|    two (e.g. 768 -> {768,384,192,96,48,24,12,6,3}, etc.)
|  > On Splitting Policy: This implementation uses a splitting policy of
|    1 (one) i.e. max one point per leaf before needing to split. Also,
|    if an insertion requires a split such that splitting would result
|    in subquadrants of less than 2x2 pixels, the insertion is rejected.
|    Thus, refactoring maybe needed to support other splitting policies.
+-----------------------------------------------------------------------
| Version Info:
|  > 08/21/2016 - Original Processing3 version
|  > 12/19/2019 - Refactored Processing3 version into P5JS version for 
|                 GitHub code portfolio + GitHub Pages live demo.
|               - Resolved issue in Processing3 version where container
|                 would retain its point versus setting to null s.t. now
|                 all container nodes correctly report no point, having
|                 'passed' it to one of its children on doing the split.
|               - Implemented ability to remove points from the quadtree
|                 and interactively via right mouse click, which I think
|                 was a 'next steps' goal of the original version!
*=====================================================================*/

var myQuadtree;

function setup() {
  var size = 768;
  createCanvas(size,size);
  myQuadtree = new QuadNode(new BBox(0,0,size,size));
} // Ends P5JS Function setup

function draw() {
  background(216);
  myQuadtree.drawTree();
} // Ends P5JS Function draw

function mousePressed(){
  if (mouseButton === LEFT) {myQuadtree.insertPoint(createVector(mouseX,mouseY));}
  if (mouseButton === RIGHT){myQuadtree.removePoint(createVector(mouseX,mouseY));}  
} // Ends P5JS Function mousePressed