

#import "PathfindingView.h"
#import "AStar.h"

static const int blockSize = 50;
static const int worldWidth = 20;
static const int worldHeight = 13;

static int world[worldWidth * worldHeight] =
{
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
    0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0,
    0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0,
    0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0,
    0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
    1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
};

static int WorldAt(int x, int y)
{
    if (x >= 0 && x < worldWidth && y >= 0 && y < worldHeight) {
        return world[y*worldWidth+x];
    } else {
        return -1;
    }
}

static void RenderWorld(void)
{
    [[NSColor brownColor] setFill];

    for (int x=0; x<worldWidth; x++) {
        for (int y=0; y<worldHeight; y++) {
            if (WorldAt(x,y)) {
                NSRectFill(NSMakeRect(x*blockSize, y*blockSize, blockSize, blockSize));
            }
        }
    }
}

static BOOL MousePointIsInWorld(NSPoint p)
{
    const int x = p.x / blockSize;
    const int y = p.y / blockSize;
    return (WorldAt(x,y) >= 0);
}

typedef struct {
    int x;
    int y;
} PathNode;

PathNode pathFrom = {0,0};
PathNode pathTo = {0,0};

static void PathNodeNeighbors(ASNeighborList neighbors, void *node, void *context)
{
    PathNode *pathNode = (PathNode *)node;

    if (WorldAt(pathNode->x+1, pathNode->y) == 0) {
        ASNeighborListAdd(neighbors, &(PathNode){pathNode->x+1, pathNode->y}, 1);
    }
    if (WorldAt(pathNode->x-1, pathNode->y) == 0) {
        ASNeighborListAdd(neighbors, &(PathNode){pathNode->x-1, pathNode->y}, 1);
    }
    if (WorldAt(pathNode->x, pathNode->y+1) == 0) {
        ASNeighborListAdd(neighbors, &(PathNode){pathNode->x, pathNode->y+1}, 1);
    }
    if (WorldAt(pathNode->x, pathNode->y-1) == 0) {
        ASNeighborListAdd(neighbors, &(PathNode){pathNode->x, pathNode->y-1}, 1);
    }
}

static float PathNodeHeuristic(void *fromNode, void *toNode, void *context)
{
    PathNode *from = (PathNode *)fromNode;
    PathNode *to = (PathNode *)toNode;

    // using the manhatten distance since this is a simple grid and you can only move in 4 directions
    return (fabs(from->x - to->x) + fabs(from->y - to->y));
}

static const ASPathNodeSource PathNodeSource =
{
    sizeof(PathNode),
    &PathNodeNeighbors,
    &PathNodeHeuristic,
    NULL,
    NULL
};

static void RenderPath(void)
{
    ASPath path = ASPathCreate(&PathNodeSource, NULL, &pathFrom, &pathTo);

    if (ASPathGetCount(path) > 1) {
        NSBezierPath *line = [NSBezierPath bezierPath];
        NSPoint p;

        for (int i=0; i<ASPathGetCount(path); i++) {
            PathNode *pathNode = ASPathGetNode(path, i);
            p = NSMakePoint((blockSize / 2.f)+pathNode->x*blockSize, (blockSize / 2.f)+pathNode->y*blockSize);
            
            if (i == 0) {
                [line moveToPoint:p];
            } else {
                [line lineToPoint:p];
            }
        }

        [line setLineWidth:4];
        [[NSColor blackColor] setStroke];
        [line stroke];
        
        [[NSString stringWithFormat:@"%g", ASPathGetCost(path)] drawAtPoint:p withAttributes:nil];
    }
    
    ASPathDestroy(path);
}

@implementation PathfindingView

- (BOOL)isFlipped
{
    return YES;
}

- (void)drawRect:(NSRect)dirtyRect
{
    RenderWorld();
    RenderPath();
}

- (void)mouseDown:(NSEvent *)theEvent
{
    const NSPoint p = [self convertPoint:[theEvent locationInWindow] fromView:nil];
    if (MousePointIsInWorld(p)) {
        pathFrom.x = p.x / blockSize;
        pathFrom.y = p.y / blockSize;
        pathTo = pathFrom;
        [self setNeedsDisplay:YES];
    }
}

- (void)mouseDragged:(NSEvent *)theEvent
{
    const NSPoint p = [self convertPoint:[theEvent locationInWindow] fromView:nil];
    if (MousePointIsInWorld(p)) {
        pathTo.x = p.x / blockSize;
        pathTo.y = p.y / blockSize;
        [self setNeedsDisplay:YES];
    }
}

@end
