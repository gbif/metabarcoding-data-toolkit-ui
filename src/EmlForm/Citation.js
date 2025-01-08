import React from "react";
import { PlusOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Tag, Tooltip } from "antd";
import _ from "lodash";
import Doi from "./Doi"
import ReactDragListView from "react-drag-listview";


const styles = {
  newTag: {
    background: "#fff",
    borderStyle: "dashed",
  },
};

/**
 * A custom Ant form control built as it shown in the official documentation
 * https://ant.design/components/form/#components-form-demo-customized-form-controls
 * Based on built-in Tag https://ant.design/components/tag/#components-tag-demo-control
 */
class CitationControl extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component
    if ("value" in nextProps) {
      // let value = stringToArray(nextProps.value);

      return { tags: _.isArray(nextProps.value) ? nextProps.value : [] };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      tags: _.isArray(props.value) ? props.value : [],
      inputVisible: false,
      inputValue: "",
      inputKey: "",
    };
  }

  handleClose = (removedTag) => {
    let tags =  this.state.tags.filter(t => t?.key !== removedTag?.key);

    this.setState({ tags });
    this.triggerChange(tags);
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputValueChange = (event) => {
    this.setState({ inputValue: event.target.value });
  };
  handleInputKeyChange = (event) => {
    this.setState({ inputKey: event.target.value });
  };
  handleInputConfirm = () => {
    const { inputKey, inputValue, tags } = this.state;
    if (inputKey && inputValue /* && !tags[inputKey] */) {
      tags[inputKey] = inputValue;
      let newTags = [...tags, {key: inputKey, value: inputValue}]

    this.setState({
      tags: newTags,
      inputVisible: false,
      inputKey: "",
      inputValue: "",
    });
    this.triggerChange(newTags);
  }
  };

  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };
  getDragProps = () => ({
    onDragEnd: (fromIndex, toIndex) => {
      const targetKeys = [...this.state.tags];
      const item = targetKeys.splice(fromIndex, 1)[0];
      targetKeys.splice(toIndex, 0, item);
      this.triggerChange(targetKeys)
    },
    nodeSelector: "li"
  });
  saveInputRef = (input) => (this.input = input);
  saveInputKeyRef = (input) => (this.inputKey = input);

  render() {
    const { tags, inputVisible, inputValue, inputKey } = this.state;
    const { classes, label, removeAll } = this.props;

    return (
      <React.Fragment>
        {Object.keys(tags).length > 0  &&
        <ReactDragListView {...this.getDragProps()}>  <ol>
            {tags.map((tag, index) => {
          const tagElem = (
            <li
              key={tag?.key}
             
            >
               
             { `${tag?.value}`} <Tooltip title="Remove"><Button onClick={() => this.handleClose(tag)} size="small" type="link"><DeleteOutlined /></Button></Tooltip>
              <Doi doi={tag?.key}/>
            </li>
          );
          return tagElem
        })}

          </ol></ReactDragListView>
        }
        
        {inputVisible && (
          <React.Fragment>
            <Input.TextArea
              rows={2}
              ref={this.saveInputRef}
              type="text"
              size="small"
              style={{ width: 400, marginRight: "10px" }}
              value={inputValue}
              placeholder={this.props.valuePlaceHolder || "Citation"}
              onChange={this.handleInputValueChange}
/*               onBlur={this.handleInputConfirm}
 */              onPressEnter={this.handleInputConfirm}
            />
            <Input
              ref={this.saveInputKeyRef}
              type="text"
              size="small"
              style={{ width: 200,  marginRight: "10px" }}
              value={inputKey}
              placeholder={this.props.keyPlaceHolder || "DOI"}
              onChange={this.handleInputKeyChange}
              onPressEnter={this.handleInputConfirm}
              addonBefore={<img
                src="/images/DOI_logo.png"
                style={{ flex: "0 0 auto", height: "16px" }}
                alt=""
              ></img>}
            />
            <Button size="small" style={{marginBottom: "22px"}} onClick={this.handleInputConfirm}>Save</Button>
          </React.Fragment>
        )}
        {!inputVisible && (
          <Tag onClick={this.showInput} style={styles.newTag}>
            <PlusOutlined /> {label}
          </Tag>
        )}
      </React.Fragment>
    );
  }
}


export default CitationControl;
