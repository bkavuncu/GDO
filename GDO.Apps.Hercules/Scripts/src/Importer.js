'use strict';
const React = require('react'),
    View = require('./ui/View'),
    colors = require('colors'),
    NavActions = require('actions/NavigationActions');

let [CHOOSE, FILE, URL] = [1,2,3];
class ImportView extends React.Component {
    constructor () {
        super();

        this.state = {
            step: CHOOSE
        };
    }
    render () {
        var containerStyle ={
            display: 'flex',
            justifyContent: 'space-around',
            alignSelf: 'stretch',
            color: 'gray',
            padding: '20px',
            flexGrow: 1,
            maxHeight: '300px',
            fontFamily: 'sans-serif'
        }, elemStyle = {
            display: 'flex',
            flexGrow: 1,
            alignItems: 'stretch',
            padding: '20px'
        }, innerStyle = {
            boxShadow: '0 0 10px gray',
            backgroundColor: 'white',
            display: 'flex',
            flexGrow: 1,
            alignSelf: 'stretch',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }, fileFormStyle = {
            display: 'none'
        }, urlFormStyle = {
            width: '60%',
            fontSize: '24px',
            marginTop: '10px',
            border: '1px solid gainsboro',
            boxShadow: 'none',
            borderRadius: 'none'
        };

        var step = this.state.step;

        var fileUpload = <div style={elemStyle}>
            <div style={innerStyle} onTouchTap={this._fileUpload.bind(this)}>
                <i className="material-icons md-64">file_upload</i>
                File Upload
            </div>
            <form style={fileFormStyle} method="post" encType="multipart/form-data">
                <input type="file" ref="fileInput" name="Image"/>
            </form>
        </div>;

        var urlUpload = <div style={elemStyle}>
            <div style={innerStyle} onTouchTap={this._urlUpload.bind(this)}>
                <i className="material-icons md-64">cloud_upload</i>
                URL import
                {step === URL?
                    <input ref="urlInput" style={urlFormStyle} type="text" placeholder="Enter URL of a CSV or JSON file"/>
                    : null }
            </div>
        </div>;

        switch (step) {
            case CHOOSE:
                return <div style={containerStyle}>
                    {fileUpload}
                    {urlUpload}
                </div>;
            case FILE:
                return <div style={containerStyle}>
                    {fileUpload}
                </div>;
            case URL:
                return <div style={containerStyle}>
                    {urlUpload}
                </div>;
        }
    }

    _fileUpload () {
        var nextStep = this.state.step === FILE? CHOOSE : FILE;
        this.setState({
            step: nextStep
        });
    }

    _urlUpload () {
        var nextStep = this.state.step === URL? CHOOSE : URL;
        this.setState({
            step: nextStep
        });
    }

    componentDidUpdate () {
        switch (this.state.step) {
            case FILE:
                this.refs.fileInput.click();
                break;
            case URL:
                //this.refs.urlInput.focus();
                break;
        }
    }
}

class NavBar extends React.Component {
    _goBack () {
        NavActions.goBack();
    }
    render () {
        var style = {
            color: 'gray',
            display: 'flex',
            justifyContent: 'flex-start',
            flex: '0 0 40px',
            alignSelf: 'stretch',
            padding: '10px'
        };
        return <div style={style} onTouchTap={this._goBack}><i className="material-icons md-36">arrow_back</i></div>;
    }
}
let [IMPORT, FILTER, EDIT] = [1,2,3];
class Importer extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            step: IMPORT
        };
    }

    render () {
        var style = {
            backgroundColor: colors.MAIN,
            flexDirection: 'column',
            justifyContent: 'flex-start'
        };

        var content = null;

        switch (this.state.step) {
            case IMPORT:
                content = <ImportView />;
        }

        return <View id="importer" style={style}>
            <NavBar />
            {content}
        </View>;
    }
}

module.exports = Importer;
