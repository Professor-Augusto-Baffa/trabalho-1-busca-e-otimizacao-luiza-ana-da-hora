var PathFindStatus = React.createClass({
    render: function() {
        return (
            <div className="panel panel-primary" id="path-find-status">
                <div className="panel-heading">
                    <h2 className="panel-title">Status do Caminho</h2>
                </div>
                <div className="panel-body">
                    <span>Passos: {this.props.data.steps}</span> < br />
                    <span> Tamanho do Caminho: {this.props.data.pathSize}</span> < br />
                    <span>Custo do Caminho: {this.props.data.pathCost}</span> < br />
                    <span>Posição Atual: {this.props.data.position[0]}, {this.props.data.position[1]}</span>
                </div>
            </div>
        );
    }
});


var BossFightStatus = React.createClass({
    render: function() {
        return (
            <div className="panel panel-primary" id="boss-fight-status">
                <div className="panel-heading">
                    <h2 className="panel-title">Status Luta</h2>
                </div>
                <div className="panel-body">
                    <span>Custo total da Luta: {this.props.data.totalCost}</span> <br />
                    <SaintStatsTable data={this.props.data}/>
                    <BossFightTable data={this.props.data}/>
                </div>
            </div>
        );
    }
});

var SaintStatsTable = React.createClass({
    render: function() {
        var saintStatsRows = [];
        for (var i = 0; i < this.props.data.saintEnergies.length; i++) {
            saintStatsRows.push(<SaintStatsRow key={i} name = {this.props.data.saintNames[i]} power = {this.props.data.saintPowers[i]} energy = {this.props.data.saintEnergies[i]} />);
        }
        return (
            <div id="stats">
                <h2></h2>
                <table className="table table-striped" id="stats-table">
                    <tr>
                        <th>
                     Cavaleiro
                        </th>
                        <th>
                         Poder
                        </th>
                        <th>
                       Energia
                        </th>
                    </tr>
                    {saintStatsRows}
                </table>
            </div>);
    }
});

var SaintStatsRow = React.createClass({
    render: function() {
        return (
            <tr>
                <td>{this.props.name}</td>
                <td>{this.props.power}</td>
                <td>{this.props.energy}</td>
            </tr>
        );
    }
});

var BossFightTable = React.createClass({
    render: function() {
        var fightRows = [];
        var numberOfHouses = this.props.data.houseCosts.length;
        for (var i = 0; i < this.props.data.houseCosts.length; i++) {
                fightRows.push(<BossFightRow key = {i} houseNumber = {i+1} houseCost = {this.props.data.houseCosts[i]} node = {this.props.data.nodes[i]} names = {this.props.data.saintNames} powers = {this.props.data.saintPowers}/>);
        }
        return (
            <div id="boss-fight-table">
                <h2>Lutas</h2>
                <table className="table table-striped" id="energy-table">
                    <tr>
                        <th>
                           Numero da casa
                        </th>
                        <th>
                            Dificuldade
                        </th>
                        <th>
                           Combinação
                        </th>
                        <th>
                           Custo
                        </th>
                    </tr>
                    {fightRows}
                </table>
            </div>);
    }
});

var BossFightRow = React.createClass({
    render: function() {
        var saints = [];
        for (var i = 0; i < this.props.node.saints.length; i++) {
            var saintIndex = this.props.node.saints[i];
            saints.push(<span key={i}>{this.props.names[saintIndex]}, </span>);
        }
        return (
            <tr>
                <td>{this.props.houseNumber}</td>
                <td>{this.props.houseCost}</td>
                <td>{saints}</td>
                <td>{Math.round(calcEffectiveCost(this.props.houseCost, this.props.node.saints, this.props.powers))}</td>
            </tr>
        );
    }
});

function renderStatus(pathFindData, bossFightData) {
    if (pathFindData !== null) {
        React.render(<PathFindStatus data={pathFindData} />, document.getElementById("path-status"));
    }
    if (bossFightData.nodes !== null) {
        React.render(<BossFightStatus data={bossFightData} />, document.getElementById("boss-status"));
    }
}
