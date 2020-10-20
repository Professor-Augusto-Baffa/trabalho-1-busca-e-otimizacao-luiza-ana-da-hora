var SaintNode = function(cost, owner, house, energies, powers,
    houseDifficulty) {
    this.cost = cost; // Accumulated cost
    this.owner = owner; // Parent node (NULL IF SUPERNODE)
    this.house = house; // casa que ele tiver nomomento
    this.houseDifficulty = houseDifficulty; // guardar em um array as dificuldades de cada casa
    this.energies = energies; // guardar em um array as energias disponiveis
    this.powers = powers; // poderes usados em cada estágio
    this.possibles = []; // possiveis combinacoes de poderes e personagens
    this.combination = [];
    this.possibilityInUse = null;

    currentNode = null;
};

SaintNode.proto.hasEnergy = function(node) { // Checks if a node has energy
    for (var i = 0; i < node.energies.length; i++) {
        if (node.energies[i] > 1)
            return true;
    }
    return false;
};

SaintNode.proto.calcEnergies = function(node, combination) {
    var energies = node.energies.slice(0); // Create a copy of energy array
    for (var i = 0; i < combination.length; i++) {
        energies[combination[i]]--;
    }
    return energies;
};

SaintNode.proto.calculatePath = function(node) {
    var path = [node];
    while (node.owner.owner !== null) {
        path.push(node.owner);
        node = node.owner;
    }
    return path;
};

SaintNode.proto.searchStep = function(currentNode, objHouse) {
    while (currentNode.possibles.length !== 0 &&
        currentNode.house !== objHouse && currentNode.hasEnergy(currentNode)) {
        // Pega a melhor possibilidade
        var bestPossIndex = currentNode.getBestPossibility();
        var poss = currentNode.possibles[bestPossIndex];

        // Remove a possibilidade do array de possibilidades
        currentNode.possibles.splice(bestPossIndex, 1);

        // Acumula o custo
        var cost = currentNode.cost +
            currentNode.houseDifficulty[currentNode.house] /
            currentNode.getPossibilityValue(poss);
        var newNode =
            new SaintNode(cost, currentNode, currentNode.house + 1,
                currentNode.calcEnergies(currentNode, poss),
                currentNode.powers, currentNode.houseDifficulty);
        newNode.combination = poss;
        newNode.possibles = newNode.getNextHousepossibles();
        currentNode = newNode;
    }

    if (currentNode.house == objHouse)
        return [true, currentNode];

    if (currentNode.possibles.length === 0 ||
        !currentNode.hasEnergy(currentNode)) {
        return [false, currentNode];
    } else {
        return [true, currentNode];
    }
};

SaintNode.proto.getPossibilityValue = function(
    possibility) { // Return the sum of powers of the heroes in this possibility
    var totalPower = 0;
    for (var i = 0; i < possibility.length; i++) {
        totalPower += this.powers[possibility[i]];
    }
    return totalPower;
};

SaintNode.proto.getBestPossibility = function() { // Return the best
    // possibility index from
    // the possibles  array
    var bestP = this.possibles[0];
    var bestPPower = this.getPossibilityValue(bestP);
    var bestPIndex = 0;
    for (var i = 1; i < this.possibles.length; i++) {
        var possibility = this.possibles[i];
        var possibilityPower = this.getPossibilityValue(possibility);
        if (possibilityPower > bestPPower) {
            bestP = this.possibles[i];
            bestPPower = possibilityPower;
            bestPIndex = i;
        }
    }
    return bestPIndex;
};

SaintNode.proto.getNextHousepossibles =
    function() { // Get the possibles  that a node has
        var nextNodes = [];
        var saintsAvailable = this.energies.map(function(val, index, array) {
            return val > 1 ? index : -1;
        });
        saintsAvailable =
            saintsAvailable.filter(function(val) { return val !== -1; });

        return this.getCombinations(saintsAvailable);
    };

SaintNode.proto.getCombinations = function(
    nums) { // Get all the combinations that is possible
    var result = [];
    var f = function(prefix, nums) {
        for (var i = 0; i < nums.length; i++) {
            result.push(prefix.concat(nums[i]));
            f(prefix.concat(nums[i]), nums.slice(i + 1));
        }
    };
    f([], nums);
    return result;
};