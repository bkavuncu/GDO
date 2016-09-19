gdo.net.app["Twitter"].sectionIsFree = function (instanceId, colStart, colEnd, rowStart, rowEnd) {

    for (var c = colStart; c <= colEnd; ++c) {
        for (var r = rowStart; r <= rowEnd; ++r) {
            if (gdo.net.instance[instanceId].caveStatus.nodes[gdo.net.getNodeId(c, r)].nodeContext !=
                gdo.net.app["Twitter"].NodeContext.FREE) {
                return false;
            }
        }
    }
    return true;
}