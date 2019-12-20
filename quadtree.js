/*======================================================================
|>>> Class BBox (Bounding Box)
+-----------------------------------------------------------------------
| Purpose: Simple 2D Bounding Box (technically square) used to represent 
|          the location and area of a Quadtree QuadNode via its top-left 
|          and bottom-right coordinates. Implements the data structure 
|          alongside simple console report and debug display functions.
+=====================================================================*/
class BBox {

  constructor(x1,y1,x2,y2){
    this.x1=x1;
    this.x2=x2;
    this.y1=y1;
    this.y2=y2;
  } // Ends Constructor

  report(){
    console.log(this.x1 + " | " + this.y1 + " | " + this.x2 + " | " + this.y2);
  } // Ends Function report

  display(){
    noFill();stroke(0,255,0);
    rect(this.x1,this.y1,this.x2-this.x1,this.y2-this.y1);
  } // Ends Function display

} // Ends Class BBox 

/*======================================================================
|>>> Class QuadNode (Quadtree Node)
+-----------------------------------------------------------------------
| Purpose: Implements Data Structure and Operations for a Point-Region
|          Quadtree. Each operation (insert, remove, and display at the
|          time of writing) utilizes recursion upon its subtree.
+-----------------------------------------------------------------------
| Implementation Notes:
+=====================================================================*/
class QuadNode{

  constructor(box){
    this.bbox = box;
    this.NE = null;
    this.NW = null;
    this.SW = null;
    this.SE = null;
    this.point = null;
    this.isContainer = false;
  } // Ends Constructor

  /*----------------------------------------------------------------------
  |>>> Function containsPoint 
  +-----------------------------------------------------------------------
  | Purpose: Given BBox (bounding box) and p5.vector reference, determines
  |          if the point exists within the bounding box area, returning a
  |          corresponding boolean value based on the result.
  | Input:   - BBox      bbox: Bounding box to test if point within
  |          - p5.vector pt:   Point to test if within Bounding Box
  +-----------------------------------------------------------------------  
  | Implementation Notes:
  |   > Why require bbox parm? Despite being a QuadNode class function, a
  |     BBox input is required (e.g. vs using QuadNode's BBox). The reason
  |     why is that this function is used to test points within the bounds
  |     of this node's child nodes in addition to its own area.
  +---------------------------------------------------------------------*/
  containsPoint(bbox, pt){
    if ( pt.x >= bbox.x1 && 
         pt.x < bbox.x2  && 
         pt.y >= bbox.y1 && 
         pt.y <  bbox.y2 ){
      return true;
    }
    return false;    
  } // Ends Function containsPoint

  /*----------------------------------------------------------------------
  |>>> Function insertPoint 
  +-----------------------------------------------------------------------
  | Purpose: Inserts a point into the Quadtree. If the point is not within
  |          the area of the call, the insertion is rejected. If the node
  |          is a leaf with no point within, the insertion succeeds. Else,
  |          the node 'splits' into 4 children, then inserts its own point
  |          into a child, then does resursive insertion on input point.
  |          This might lead to a 'cascade' of recursive insertions if the
  |          points are very close to each other.
  | Input:   - p5.vector pt: point to insert into Quadtree
  +-----------------------------------------------------------------------
  | Implementation Notes: The description above and inline comments within
  |                       the code provide sufficient enough detail.
  +---------------------------------------------------------------------*/
  insertPoint(pt){

    // If the point does not exist within this cell - return
    if(!this.containsPoint(this.bbox, pt)){
      return false;
    }

    // If this node is a leaf and no point is currently assigned, assign it
    if(!this.isContainer && this.point == null){
      this.point = pt;
      return true;
    }

    // There is a point in this cell - do recursive split
    if(this.NE==null){

      var xMid = (this.bbox.x2 - this.bbox.x1) / 2;
      var yMid = (this.bbox.x2 - this.bbox.x1) / 2;

      // Splitting can only occur if resulting subquadrants are at least 2x2 pixels, else insert rejected.
      if(xMid<2){
        console.log("Cannot Insert Point - Split would form quadrants that are too small (i.e. less than 4x4 pixels)!");
        return false;
      }

      // Split -> creating 4 nodes foreach quadrant
      this.NW = new QuadNode( new BBox(this.bbox.x1,      this.bbox.y1,      this.bbox.x1+xMid, this.bbox.y1+yMid) );
      this.NE = new QuadNode( new BBox(this.bbox.x1+xMid, this.bbox.y1,      this.bbox.x2,      this.bbox.y1+yMid) );
      this.SW = new QuadNode( new BBox(this.bbox.x1,      this.bbox.y1+yMid, this.bbox.x1+xMid, this.bbox.y2) );
      this.SE = new QuadNode( new BBox(this.bbox.x1+xMid, this.bbox.y1+yMid, this.bbox.x2,      this.bbox.y2) );

      // Place this node's point within the appropriate child
      if (this.containsPoint(this.NW.bbox, this.point)) {
        this.NW.point=this.point;
        this.isContainer=true;
      } else if (this.containsPoint(this.NE.bbox, this.point)) {
        this.NE.point=this.point;
        this.isContainer=true;
      } else if (this.containsPoint(this.SE.bbox, this.point)) {
        this.SE.point=this.point;
        this.isContainer=true;
      } else if (this.containsPoint(this.SW.bbox, this.point)) {
        this.SW.point=this.point;
        this.isContainer=true;
      }

      // This is now a container node - set it's point to null
      this.point = null;

    }

    // Place input point within its appropriate child via recursive call
    if (this.NW.insertPoint(pt)) {return true;}
    if (this.NE.insertPoint(pt)) {return true;}
    if (this.SW.insertPoint(pt)) {return true;}
    if (this.SE.insertPoint(pt)) {return true;}

    return false;

  } // Ends Function insertPoint


  /*----------------------------------------------------------------------
  |>>> Function removePoint 
  +-----------------------------------------------------------------------
  | Purpose: Removes a point into the Quadtree via the following design. 
  |          If the node is a leaf and the point exists in its area, the
  |          point is simply set to null (now implying empty leaf) and the
  |          function returns. Else if a container node, a recursive call
  |          of this function is made on the child in bounds of the point.
  |          On returning from recursion: several scenarios are possible,
  |          checked for, and correspondingly handled as follows:
  |            (1) If all children are empty leaves (i.e. point==null),
  |                set them all to null (i.e. 'prune' tree), then set this
  |                node as an empty leaf. If this node's siblings are also
  |                empty leaves, this node's parent will recurse the same 
  |                process on its return from recursion on child nodes.
  |            (2) Else if exactly 1 child is a non-empty leaf, set this
  |                node as a non-empty leaf with that child's point (i.e.
  |                'folding up' the tree), then set all children to null 
  |                (i.e. 'prune').
  |            (3) Else, one or more children are either containers and/or
  |                non-empty leaves), so do nothing to them and return.
  | Input:   - p5.vector pt: point to remove from the Quadtree
  +-----------------------------------------------------------------------
  | Implementation Notes: The description above and inline comments within
  |                       the code provide sufficient enough detail.
  +---------------------------------------------------------------------*/
  removePoint(pt){

    // I am a leaf and point exists in my area -> set point to null and return
    if(!this.isContainer && this.containsPoint(this.bbox, pt)){
      this.point = null;
      return;
    }

    // I am a container -> Recursive call into child containing the point
    if      (this.containsPoint(this.NW.bbox, pt)) {this.NW.removePoint(pt);}
    else if (this.containsPoint(this.NE.bbox, pt)) {this.NE.removePoint(pt);}
    else if (this.containsPoint(this.SE.bbox, pt)) {this.SE.removePoint(pt);} 
    else if (this.containsPoint(this.SW.bbox, pt)) {this.SW.removePoint(pt);}

    // Determine if all children are leaf nodes
    var allChildrenAreLeaves = true;
    if (this.NW.isContainer) {allChildrenAreLeaves = false;}
    if (this.NE.isContainer) {allChildrenAreLeaves = false;}
    if (this.SE.isContainer) {allChildrenAreLeaves = false;}
    if (this.SW.isContainer) {allChildrenAreLeaves = false;}

    // At least 1 child is a container -> don't prune children yet
    if(!allChildrenAreLeaves){return;}

    // All children are leaves -> determine how many have points within
    var numChildrenLeavesPts = 0;
    if (this.NW.point!=null) {numChildrenLeavesPts+=1;}
    if (this.NE.point!=null) {numChildrenLeavesPts+=1;}
    if (this.SE.point!=null) {numChildrenLeavesPts+=1;}
    if (this.SW.point!=null) {numChildrenLeavesPts+=1;}

    // All children are empty leaves -> prune them, make this node a leaf with no point, and return
    if(numChildrenLeavesPts==0){
      this.NE = null;
      this.NW = null;
      this.SW = null;
      this.SE = null;
      this.point = null;
      this.isContainer = false;
      return;   
    }

    // Exactly 1 child has a point -> make this node a leaf with that point, prune them, and return
    if(numChildrenLeavesPts==1){
      if      (this.NW.point!=null) {this.point = this.NW.point;}
      else if (this.NE.point!=null) {this.point = this.NE.point;}
      else if (this.SE.point!=null) {this.point = this.SE.point;}
      else if (this.SW.point!=null) {this.point = this.SW.point;}
      this.NE = null;
      this.NW = null;
      this.SW = null;
      this.SE = null;
      this.isContainer = false;      
    }

  } // Ends Function removePoint


  /*----------------------------------------------------------------------
  |>>> Function drawTree 
  +-----------------------------------------------------------------------
  | Purpose: Simple function that displays a QuadNode and its subtree to
  |          the canvas i.e. the 'Visualization Function'. Note that it's
  |          naturally recursive, and to display the entire Quadtree, call
  |          this upon the external root reference (i.e. in main.js)
  +---------------------------------------------------------------------*/
  drawTree(){
    noFill();

    stroke(255,120,0); strokeWeight(2);
    if (this.point!=null && this.isContainer==false) {ellipse(this.point.x, this.point.y, 10, 10);}

    stroke(0,60,255); strokeWeight(1);
    rect(this.bbox.x1, this.bbox.y1, this.bbox.x2-this.bbox.x1, this.bbox.y2-this.bbox.y1); 
    
    if (this.NW!=null) {this.NW.drawTree();}
    if (this.NE!=null) {this.NE.drawTree();}
    if (this.SE!=null) {this.SE.drawTree();}
    if (this.SW!=null) {this.SW.drawTree();}

  } // Ends Method drawTree

} // Ends Class QuadNode