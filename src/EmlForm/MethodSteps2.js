import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Input, Tag, Tooltip, Steps, Timeline } from 'antd';
import ReactDragListView from "react-drag-listview";


const stringToArray = value => {
  if (Array.isArray(value)) {
    return value;
  } else if (value) {
    return [value];
  }

  return [];
};

const styles = {
  newTag: {
    background: '#fff',
    borderStyle: 'dashed'
  }
};

/**
 * A custom Ant form control built as it shown in the official documentation
 * https://ant.design/components/form/#components-form-demo-customized-form-controls
 * Based on built-in Tag https://ant.design/components/tag/#components-tag-demo-control
 */
class TagControl extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component
    if ('value' in nextProps) {
      let value = stringToArray(nextProps.value);

      return { tags: value };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      tags: stringToArray(props.value),
      inputVisible: false,
      inputValue: ''
    };
  }

  handleClose = removedTag => {
    const tags = this.state.tags.filter(tag => tag !== removedTag);

    this.setState({ tags });
    this.triggerChange(tags);
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = event => {
    this.setState({ inputValue: event.target.value });
  };

  handleInputConfirm = () => {
    const state = this.state;
    const inputValue = state.inputValue;
    let tags = state.tags;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }

    this.setState({
      tags,
      inputVisible: false,
      inputValue: ''
    });
    this.triggerChange(tags);
  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };

  saveInputRef = input => this.input = input;
  getDragProps = () => ({
    onDragEnd: (fromIndex, toIndex) => {
      const targetKeys = [...this.state.tags];
      const item = targetKeys.splice(fromIndex, 1)[0];
      targetKeys.splice(toIndex, 0, item);
      this.triggerChange(targetKeys)
    },
    nodeSelector: ".ant-steps-item"
  });
  render() {
    const { tags, inputVisible, inputValue } = this.state;
    const { label, removeAll } = this.props;
    const newElement = <>{inputVisible && (
      <Input.TextArea
        ref={this.saveInputRef}
        type="text"
        size="small"
        value={inputValue}
        onChange={this.handleInputChange}
        onBlur={this.handleInputConfirm}
        onPressEnter={this.handleInputConfirm}
      />
    )}
      {!inputVisible && (
        <Tag onClick={this.showInput} style={styles.newTag}>
          <PlusOutlined /> {label}
        </Tag>
      )}</>

    let items = [...tags.map((tag, index) => {
      const tagElem = (
        <Tag key={tag} closable={removeAll || index !== 0} onClose={() => this.handleClose(tag)}>
          {tag}
        </Tag>

      );
      return { title: tagElem };
    })]

    if(tags.length > 0){
      items = [...items, {title: newElement}]
    }

    return (
      <React.Fragment>
        {/* <Timeline mode={"left"}>
        {tags.map((tag, index) => {
          const tagElem = (
            <Timeline.Item label={index+1}><Tag key={tag} closable={removeAll || index !== 0} onClose={() => this.handleClose(tag)}>
              {tag}
            </Tag></Timeline.Item>
            
          );
          return tagElem;
        })}
        
      </Timeline> */}
      {tags.length > 0 ? 
        <ReactDragListView {...this.getDragProps()}>
      <Steps
          direction="vertical"
          progressDot
          current={tags.length}
          items={items}
        /></ReactDragListView> : newElement}


      </React.Fragment>
    );
  }
}

export default TagControl;