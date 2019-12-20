

class BBox {
  constructor(x1,y1,x2,y2){
    this.x1=x1;
    this.x2=x2;
    this.y1=y1;
    this.y2=y2;
  }

  report(){
    console.log(this.x1 + " | " + this.y1 + " | " + this.x2 + " | " + this.y2);
  }

  display(){
    noFill();stroke(0,255,0);
    rect(this.x1,this.y1,this.x2-this.x1,this.y2-this.y1);
  }
}


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

  containsPoint(bbox, pt){
    if ( pt.x >= bbox.x1 && 
         pt.x < bbox.x2  && 
         pt.y >= bbox.y1 && 
         pt.y <  bbox.y2 ){
      return true;
    }
    return false;    
  } // Ends Function containsPoint


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


    if (this.NW.insertPoint(pt)) {return true;}
    if (this.NE.insertPoint(pt)) {return true;}
    if (this.SW.insertPoint(pt)) {return true;}
    if (this.SE.insertPoint(pt)) {return true;}

    return false;


  } // Ends Function insertPoint


  /* BASIC ALGORITHM: 
     > If I am a leaf and point exists in my area, do:
        1) set point to null
        2) return

     > If I am a container do: 
        1) recurse call into child that point is contained within
        2) on return from recursion, check if all 4 children are leaves with no points within them
        3) if exactly one child is a leaf with a point, set this node's point to the child's point
        4) if conditions 2 or 3 happened, set all children to null and this node as a leaf node
        5) return
  */
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

    // Otherwise: 2 or more children leaves have points -> leave them alone for now

  } // Ends Function removePoint


  // This is a recursive function
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

}