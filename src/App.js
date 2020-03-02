// IMPORTS 
import React, { useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Form, Row, Col, Card, Radio, Select, DatePicker, Input, Button, Modal } from 'antd';
import { _COURSES, _VALID_DATES, _DEFAULT_DATE_FORMAT, _FORM_STYLE } from './helpers/utils';
import './App.css';

// PAGE CONSTANTS
const { TextArea } = Input;
const MSG_REQ_SUBJECT = 'Please select course subject';
const MSG_REQ_DATE = 'Please select start date';
const MSG_INVALID_DATE = 'Your selected course and subject is not offered beginning from your selected date';
const MSG_INVALID_NOTES = 'Length must be within 20-500 characters';

function App() {
  // DEFAULT FORM DATA 
  const default_form_data = {
    course_id: _COURSES[0].id,
    subject_id: '',
    start_date: null,
    notes: '',
    valid_subject: true,
    valid_start_date: true,
    valid_notes: true,
    loading: false
  };

  // INITIALIZE HOOKS
  const [form_data, setFormData] = useState(default_form_data);

  // EVENT TO LOAD SUBJECT FOR SELECTED COURSES
  const loadCourseSubjects = () => {
    const found = _.find(_COURSES, c => { return c.id === form_data.course_id });
    return !_.isEmpty(found) ? found.subjects : [];
  }

  // HANDLE ALL FORM CONTROL CHANGES
  const handleChange = (payload) => {
    
    if (_.has(payload, 'subject_id')) {
      payload = { ...payload, valid_subject: _.isNumber(payload.subject_id) };
    }

    if (_.has(payload, 'course_id')) {
      payload = { ...payload, subject_id: '', valid_subject: true };
    }

    if (_.has(payload, 'start_date')) {
      payload = { ...payload, valid_start_date: validateDate(payload.start_date) };
    }

    if (_.has(payload, 'notes')) {
      payload = { ...payload, valid_notes: validateNotes(payload.notes) };
    }

    setFormData({ ...form_data, ...payload });
  }

  // VALIDATE COURSE START DATE
  const validateDate = (start_date) => {
    if (!_.isEmpty(start_date)) {
      const s_date = moment(start_date).format(_DEFAULT_DATE_FORMAT);
      const found = _.find(_VALID_DATES, date => { return date === s_date });

      return !_.isEmpty(found);
    } else {
      return false;
    }
  }

  // VALIDATE ADDITIONAL NOTES
  const validateNotes = (notes) => {
    const len = notes.length;
    return (len >= 20 && len <= 500);
  }

  // SHOW APPROPRIATE MESSAGE FOR DATE SELECTION
  const getInvalidDateMessage = () => {
    return _.isEmpty(form_data.start_date) ? MSG_REQ_DATE : MSG_INVALID_DATE;
  }

  // HANDLE FORM SUBMIT 
  const onSubmit = () => {
    let payload = { ...form_data };

    payload = {
      ...payload,
      valid_subject: _.isNumber(payload.subject_id),
      valid_start_date: validateDate(payload.start_date),
      valid_notes: validateNotes(payload.notes),
    };

    if (payload.valid_subject && payload.valid_start_date && payload.valid_notes) {
      // VALID FORM DATA
      payload = {
        ...payload,
        loading: true,
      };
      setFormData({ ...form_data, ...payload });
      showSuccessMessage();
    } else {
      // INVALID FORM DATA
      setFormData({ ...form_data, ...payload });
    }
  }

  // PUT DELAY AND SHOW MESSAGE ON SCREEN
  const showSuccessMessage = () => {
    setTimeout(() => {
      setFormData({ ...form_data, loading: false });
      Modal.confirm({
        content: 'Your course has been successfully registered.',
        onOk: () => {
          resetForm();
        },
        onCancel: () => {
          resetForm();
        },
      });
    }, 3000);
  }

  const resetForm = () => {
    setFormData({
      ...form_data,
      ...default_form_data
    });
  }

  return (
    <div className="App mt-20">
      <Card title="Course Registration">
        <Form
          {..._FORM_STYLE}
          layout={"vertical"}>
          <Row>
            <Col span={24}>
              <Form.Item label="Course">
                <Radio.Group value={form_data.course_id} onChange={({ target: { value } }) => handleChange({ course_id: value })} >
                  {_.map((_COURSES || []), (course, key) => {
                    return (<Radio.Button value={course.id} key={key}>{course.name}</Radio.Button>)
                  })}
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item label="Subject" className="required">
                <Select onChange={(value) => handleChange({ subject_id: value })} value={form_data.subject_id}>
                  <Select.Option value="">Please select subject</Select.Option>
                  {_.map((loadCourseSubjects() || []), (sub, key) => {
                    return (<Select.Option value={sub.id} key={key}>{sub.name}</Select.Option>)
                  })}
                </Select>
                <div className="err-msg">{!form_data.valid_subject && MSG_REQ_SUBJECT}</div>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item label="Start Date" className="required">
                <DatePicker
                  value={form_data.start_date}
                  className="full-width"
                  format={_DEFAULT_DATE_FORMAT}
                  onChange={(value) => handleChange({ start_date: value })}
                />
                <div className="err-msg">{!form_data.valid_start_date && getInvalidDateMessage()}</div>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item label="Additional Notes">
                <TextArea
                  value={form_data.notes}
                  rows={3}
                  onChange={({ target: { value } }) => handleChange({ notes: value })}
                />
                <div className="err-msg">{!form_data.valid_notes && MSG_INVALID_NOTES}</div>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Button type="primary" onClick={onSubmit} loading={form_data.loading}>Submit</Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

export default App;
