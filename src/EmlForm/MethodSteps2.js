import React from 'react';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Input, Tag, Tooltip, Steps, Timeline, Card, Button , Row, Col, Typography} from 'antd';
import ReactDragListView from "react-drag-listview";

const { Paragraph } = Typography;

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
      inputValue: '',
      editStepIndex: -1
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

  editStep = (step, index) => {
    this.setState(
      { inputValue: step, editStepIndex: index }
    );
  };

 /*  handleInputConfirm = () => {
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
  }; */

  handleInputConfirm = () => {
    const {tags, editStepIndex, inputValue} = this.state
    let tags_ = [];
    if(editStepIndex > -1){
      tags_ = [...tags];
      tags_.splice(editStepIndex, 1, inputValue)
    } else {
      tags_ = [...tags, inputValue]
    }

    this.setState({
      tags: tags_,
      inputVisible: false,
      inputValue: '',
      editStepIndex: -1
    });
    this.triggerChange(tags_)
    ;
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
    const { tags, inputVisible, inputValue, editStepIndex } = this.state;
    const { label, removeAll } = this.props;
    const newElement = <>{inputVisible && (
      <Input.TextArea
        ref={this.saveInputRef}
        type="text"
        size="small"
        rows={5}

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

      const editElement = 
        <Input.TextArea
          type="text"
          size="small"
          rows={5}
          value={inputValue}
          onChange={this.handleInputChange}
          onBlur={this.handleInputConfirm}
          onPressEnter={this.handleInputConfirm}
        />
      

    let items = [...tags.map((tag, index) => {
      const tagElem = (
        <Tag key={tag} 
          onClick={() => this.setState({editStepIndex: index, inputValue: tag})}
          closable={removeAll || index !== 0} onClose={() => this.handleClose(tag)}>
          {tag}
        </Tag>

      );

      const tagElem2 = <
    >
    <Row><Col><>
    <Button size='small' onClick={() => this.setState({editStepIndex: index, inputValue: tag})}style={{padding: 0}} type='link'><EditOutlined />
    </Button> 
    <Button size='small' type='link' onClick={() => this.handleClose(tag)}><DeleteOutlined /></Button></></Col></Row>

    <Row><Col>{tag}</Col></Row>

    </>
      return { description: tagElem2 };
    })]

    if(tags.length > 0 && editStepIndex < 0){
      items = [...items, {description: newElement}]
    }
    if(tags.length > 0 && editStepIndex > -1){
      items.splice(editStepIndex, 1, {description: editElement})
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