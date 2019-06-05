import { Button, Icon, Table, Upload, Input } from 'antd';
import React from 'react';
import { JsonRpcClient } from "../../jsonrpc";

class CellCounterService extends React.Component {

  constructor(props) {
    super(props);

    this.submitAction = this.submitAction.bind(this);
    this.state = {
      fileUploaded: false,
      file: undefined,
      fileReader: undefined,
      methodName: "count_red_cells",
      redIntensityLower: 100,
      inputValid: true,
    };

    this.columnCaptions = {
      global_cell_count: "Total cell count",
      red_cell_count: "Red cell count",
      percentage_of_red_cells: "Percentage of red cells",
    };
  }

  isComplete() {
    return this.state.resultValues !== undefined;
  }

  processFile(file) {
    let reader = new FileReader();

    reader.onload = (e => {
      this.setState({
        fileUploaded: true,
        file: file,
        fileReader: reader,
      });
    });

    reader.readAsDataURL(file);
  }

  isPreviewAvailable() {
    if (this.state.file) {
      const ext = this.state.file.type.split('/')[1];
      return ext === "png" || ext === "jpg" || ext === "jpeg";
    }
    return false;
  }

  submitAction() {
    this.callApi(this.state.methodName, {
      image: this.state.fileReader.result.split(',')[1],
      red_intensity_lower: this.state.redIntensityLower,
    });
  }

  callApi(methodName, params) {
    this.setState({
      working: true,
    });
    let rpcClient = new JsonRpcClient({ endpoint: "/api" });

    rpcClient.request(methodName, params).then(rpcResponse => {
      this.setState({
        working: false,
      });
      console.log(rpcResponse);
      this.parseResult(rpcResponse);
    }).catch((rpcError) => {
      this.setState({
        working: false,
      });
      console.log(rpcError);
      alert(rpcError.message);
    });
  }

  parseResult(rpcResponse) {
    if (rpcResponse === undefined) {
      return;
    }

    let resultColums = Object.keys(rpcResponse).map(item => {
      return {
        title: this.columnCaptions[item] || item,
        dataIndex: item,
        key: item,
        width: 150,
      }
    });

    let resultValues = {};

    Object.keys(rpcResponse).forEach(item => {
      resultValues[item] = rpcResponse[item].toString();
    });

    this.setState((prevState) => ({
      resultColums: resultColums,
      resultValues: [resultValues],
    }));
  }

  resetState() {
    this.setState({
      fileUploaded: false,
      file: undefined,
      fileReader: undefined,
      resultColums: undefined,
      resultValues: undefined,
    });
  }

  updateValid() {
    const redIntensityLower = Number.parseInt(this.state.redIntensityLower);
    const inputValid = redIntensityLower >= 0 && redIntensityLower <= 255;
    this.setState({
      inputValid: inputValid
    });
  }

  handleInputChange(e) {
    this.setState({
      redIntensityLower: e.target.value
    });
    this.updateValid();
  }

  renderForm() {
    const { fileUploaded, file, redIntensityLower, inputValid, working } = this.state;

    return (
      <React.Fragment>
        <div>
          {
            !fileUploaded &&
            <React.Fragment>
              <br />
              <br />
              <Upload.Dragger name="file" accept=".jpg,.jpeg,.png,.tiff,.tif" beforeUpload={(file) => { this.processFile(file); return false; }} >
                <p className="ant-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">Click for file-chooser dialog or drag a file to this area to be analyzed.</p>
              </Upload.Dragger>
              <br />
            </React.Fragment>
          }
          <table>
            <tbody>
              <tr>
                <td><b>File:</b></td>
                <td>{file ? `${file.name}` : '(not uploaded)'}</td>
              </tr>
            </tbody>
          </table>
          <br />
          {
            this.isPreviewAvailable() &&
            <div>
              <img style={{ maxWidth: "500px" }} src={this.state.fileReader.result} />
              <br />
              <br />
            </div>
          }
          <label>
            <div>Red Intensity Lower Bound (0-255): </div>
            <br />
            <Input size="large" placeholder="Red Intensity Lower" type="text" value={redIntensityLower} onChange={(e) => this.handleInputChange(e)} />
          </label>
          <br />
          <br />
          <br />
          <Button type="primary" onClick={() => { this.submitAction(); }} disabled={!fileUploaded || !inputValid || working} >
            {working ? "Working..." : "Count cells"}
          </Button>
        </div>
      </React.Fragment>
    )
  }

  renderComplete() {
    return (
      <div>
        <br />
        {
          this.isPreviewAvailable() &&
          <div>
            <img style={{ maxWidth: "500px" }} src={this.state.fileReader.result} />
            <br />
            <br />
          </div>
        }
        <Table pagination={false} columns={this.state.resultColums} dataSource={this.state.resultValues} />
        <br />
        <br />
        <br />
        <Button type="primary" onClick={() => { this.resetState(); }}>New cells count</Button>
      </div>
    );
  }

  renderDescription() {
    return (
      <div>
        <p>A service that takes an image and count red cells ot it.</p>
      </div>
    )
  }

  render() {
    if (this.isComplete())
      return (
        <div>
          {this.renderDescription()}
          {this.renderComplete()}
        </div>
      );
    else
      return (
        <div>
          {this.renderDescription()}
          {this.renderForm()}
        </div>
      )
  }
}

export default CellCounterService;