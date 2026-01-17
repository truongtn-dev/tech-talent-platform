import React from "react";
import { Form, Input, Collapse, DatePicker, Button, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined, RobotOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { TextArea } = Input;

const CVForm = ({ data, onChange, onAiImprove, aiLoading }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (data) {
            form.setFieldsValue({
                // Flatten personalInfo fields to root level for the Form
                ...data.personalInfo,
                // List fields map directly
                experience: data.experience,
                education: data.education,
                skills: data.skills
            });
        }
    }, [data, form]);

    const onValuesChange = (changedValues, allValues) => {
        onChange("personalInfo", {
            fullName: allValues.fullName,
            jobTitle: allValues.jobTitle,
            email: allValues.email,
            phone: allValues.phone,
            summary: allValues.summary,
            location: allValues.location // added location support if missing
        });
        onChange("experience", allValues.experience);
        onChange("education", allValues.education);
        onChange("skills", allValues.skills);
    };

    return (
        <Form layout="vertical" form={form} onValuesChange={onValuesChange}>
            <Collapse
                defaultActiveKey={['1']}
                items={[
                    {
                        key: '1',
                        label: 'Personal Information',
                        children: (
                            <>
                                <Form.Item name="fullName" label="Full Name">
                                    <Input placeholder="John Doe" />
                                </Form.Item>
                                <Form.Item name="jobTitle" label="Job Title">
                                    <Input placeholder="Senior Developer" />
                                </Form.Item>
                                <Form.Item name="email" label="Email">
                                    <Input placeholder="john@example.com" />
                                </Form.Item>
                                <Form.Item name="phone" label="Phone">
                                    <Input placeholder="+1 234 567 890" />
                                </Form.Item>
                                <Form.Item name="summary" label="Summary">
                                    <TextArea rows={4} />
                                </Form.Item>
                                <Form.Item name="location" label="Location">
                                    <Input placeholder="City, Country" />
                                </Form.Item>
                            </>
                        )
                    },
                    {
                        key: '2',
                        label: 'Experience',
                        children: (
                            <Form.List name="experience">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <div key={key} style={{ marginBottom: 16, borderBottom: "1px solid #f0f0f0", paddingBottom: 16 }}>
                                                <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'company']}
                                                        rules={[{ required: true, message: 'Missing company' }]}
                                                    >
                                                        <Input placeholder="Company" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'role']}
                                                        rules={[{ required: true, message: 'Missing role' }]}
                                                    >
                                                        <Input placeholder="Role" />
                                                    </Form.Item>
                                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "red" }} />
                                                </Space>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'period']}
                                                >
                                                    <Input placeholder="Period (e.g. 2020 - 2023)" />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'description']}
                                                    style={{ marginBottom: 8 }}
                                                >
                                                    <TextArea rows={3} placeholder="Description (Bullet points recommended)" />
                                                </Form.Item>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        icon={<RobotOutlined />}
                                                        loading={aiLoading}
                                                        onClick={() => {
                                                            const currentDesc = form.getFieldValue(['experience', name, 'description']);
                                                            onAiImprove(['experience', name, 'description'], currentDesc);
                                                        }}
                                                    >
                                                        AI Improve
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add Experience
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        )
                    },
                    {
                        key: '3',
                        label: 'Education',
                        children: (
                            <Form.List name="education">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <div key={key} style={{ marginBottom: 16, borderBottom: "1px solid #f0f0f0", paddingBottom: 16 }}>
                                                <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'school']}
                                                        rules={[{ required: true, message: 'Missing school' }]}
                                                    >
                                                        <Input placeholder="School" />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'degree']}
                                                    >
                                                        <Input placeholder="Degree" />
                                                    </Form.Item>
                                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "red" }} />
                                                </Space>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'year']}
                                                >
                                                    <Input placeholder="Year (e.g. 2020)" />
                                                </Form.Item>
                                            </div>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add Education
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        )
                    },
                    {
                        key: '4',
                        label: 'Skills',
                        children: (
                            <Form.List name="skills">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'name']}
                                                    rules={[{ required: true, message: 'Missing skill' }]}
                                                >
                                                    <Input placeholder="Skill (e.g. React)" />
                                                </Form.Item>
                                                <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "red" }} />
                                            </Space>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add Skill
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        )
                    }
                ]}
            />
        </Form>
    );
};

export default CVForm;
