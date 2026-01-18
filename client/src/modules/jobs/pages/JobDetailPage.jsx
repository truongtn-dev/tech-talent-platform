import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Tag,
  Divider,
  Typography,
  Spin,
  message,
  Row,
  Col,
  Modal,
  Radio,
  Space,
  Select,
  Upload,
  Alert
} from "antd";
import applicationService from "../../../services/applicationService";
import {
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  UploadOutlined
} from "@ant-design/icons";
import jobService from "../api";
import cvService from "../../../services/cvService";
import uploadService from "../../../services/uploadService";
import { useAuth } from "../../../context/AuthContext";
import DOMPurify from "dompurify";

const { Title, Text, Paragraph } = Typography;

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [appStatus, setAppStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    fetchJobDetail();
    if (user) checkAppStatus();
  }, [id, user]);

  const checkAppStatus = async () => {
    setLoadingStatus(true);
    try {
      const status = await applicationService.checkApplicationStatus(id);
      setAppStatus(status);
    } catch (err) {
      console.error("Error checking app status", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchJobDetail = async () => {
    setLoading(true);
    try {
      const data = await jobService.getJobById(id);
      setJob(data.job || data);
    } catch (error) {
      console.error("Error fetching job details:", error);
      message.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [applyType, setApplyType] = useState("PROFILE");

  // States for other methods
  const [userCVs, setUserCVs] = useState([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [fileList, setFileList] = useState([]);

  const handleApplyClick = () => {
    if (!user) {
      message.warning("Please login to apply for this job");
      navigate("/login");
      return;
    }

    // Fetch user CVs in background when opening modal
    setLoadingCVs(true);
    cvService.getMyCVs()
      .then(data => {
        setUserCVs(data || []);
        // Auto select default
        const defaultCv = data?.find(c => c.isDefault);
        if (defaultCv) setSelectedCvId(defaultCv._id);
        else if (data?.length > 0) setSelectedCvId(data[0]._id);
      })
      .catch(err => console.error("Failed to fetch CVs", err))
      .finally(() => setLoadingCVs(false));

    setIsApplyModalVisible(true);
  };

  const handleApplySubmit = async () => {
    setApplying(true);
    try {
      let applicationData = {
        jobId: job._id,
        cvType: applyType,
      };

      if (applyType === "ONLINE") {
        if (!selectedCvId) {
          message.error("Please select a CV");
          setApplying(false);
          return;
        }
        applicationData.cvId = selectedCvId;
      } else if (applyType === "UPLOAD") {
        if (fileList.length === 0) {
          message.error("Please upload a CV");
          setApplying(false);
          return;
        }

        const file = fileList[0].originFileObj;
        const uploadRes = await uploadService.uploadCV(file);
        // uploadRes should contain the upload record, assume it returns the object directly or in .data
        // Typically http.js returns response.data directly if configured.
        // Let's assume it returns the upload object which has _id

        if (!uploadRes || !uploadRes._id) {
          throw new Error("Upload failed");
        }

        applicationData.uploadId = uploadRes._id;
      }

      await applicationService.applyJob(applicationData);

      message.success("Application submitted successfully!");
      setIsApplyModalVisible(false);
      setFileList([]); // Clear files
      checkAppStatus();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px 0",
          minHeight: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!job) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px 0",
          minHeight: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        <Title level={3}>Job not found</Title>
        <Button
          type="primary"
          onClick={() => navigate("/jobs")}
          style={{ backgroundColor: "#ED1B2F", borderColor: "#ED1B2F" }}
        >
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        paddingBottom: 60,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1f1f1f 0%, #ED1B2F 100%)",
          padding: "40px 0",
          color: "white",
        }}
      >
        <div
          className="container"
          style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/jobs")}
            style={{ color: "white", marginBottom: 24, padding: 0 }}
          >
            Back to Jobs
          </Button>
          <Title level={2} style={{ color: "white", marginBottom: 8 }}>
            {job.title}
          </Title>
          <Title level={4} style={{ color: "#e0e0e0", fontWeight: 400 }}>
            {job.company}
          </Title>
        </div>
      </div>

      {/* Content */}
      <div
        className="container"
        style={{ maxWidth: 1000, margin: "-40px auto 0", padding: "0 24px" }}
      >
        <Row gutter={24}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: 12, marginBottom: 24 }}>
              {/* Job Overview */}
              <div style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: "center" }}>
                      <EnvironmentOutlined
                        style={{
                          fontSize: 24,
                          color: "#ED1B2F",
                          marginBottom: 8,
                        }}
                      />
                      <div>
                        <Text
                          type="secondary"
                          style={{ display: "block", fontSize: 12 }}
                        >
                          Location
                        </Text>
                        <Text strong>{job.location || "Remote"}</Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: "center" }}>
                      <ProjectOutlined
                        style={{
                          fontSize: 24,
                          color: "#ED1B2F",
                          marginBottom: 8,
                        }}
                      />
                      <div>
                        <Text
                          type="secondary"
                          style={{ display: "block", fontSize: 12 }}
                        >
                          Job Type
                        </Text>
                        <Text strong>
                          {job.type?.replace("_", " ") || "Full Time"}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: "center" }}>
                      <DollarOutlined
                        style={{
                          fontSize: 24,
                          color: "#ED1B2F",
                          marginBottom: 8,
                        }}
                      />
                      <div>
                        <Text
                          type="secondary"
                          style={{ display: "block", fontSize: 12 }}
                        >
                          Salary
                        </Text>
                        <Text strong>{job.salary || "Negotiable"}</Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div style={{ textAlign: "center" }}>
                      <CalendarOutlined
                        style={{
                          fontSize: 24,
                          color: "#ED1B2F",
                          marginBottom: 8,
                        }}
                      />
                      <div>
                        <Text
                          type="secondary"
                          style={{ display: "block", fontSize: 12 }}
                        >
                          Posted
                        </Text>
                        <Text strong>
                          {job.createdAt
                            ? new Date(job.createdAt).toLocaleDateString()
                            : "Recently"}
                        </Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              <Divider />

              {/* Description */}
              <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ fontWeight: 800, fontSize: 36 }}>
                  Job Description
                </Title>
                <div
                  className="job-description-content"
                  style={{ fontSize: 16, lineHeight: 1.8, color: "#374151" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(job.description),
                  }}
                />
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div style={{ marginBottom: 32, background: "#f8fafc", padding: "32px", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                  <Title level={3} style={{ marginTop: 0, marginBottom: 24, fontSize: 24 }}>Requirements</Title>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {job.requirements.map((req, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                        <div style={{
                          minWidth: 24, height: 24,
                          background: "#dcfce7", color: "#16a34a",
                          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                          marginTop: 2
                        }}>
                          <CheckCircleOutlined style={{ fontSize: 14 }} />
                        </div>
                        <Text style={{ fontSize: "16px", lineHeight: "1.6", color: "#334155" }}>{req}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <Title level={3} style={{ marginBottom: 16, fontSize: 24 }}>Required Skills</Title>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    {job.skills.map((skill, idx) => (
                      <Tag
                        key={idx}
                        style={{
                          padding: "8px 20px",
                          fontSize: "15px",
                          background: "#fff",
                          color: "#2563eb",
                          border: "1px solid #bfdbfe",
                          borderRadius: "100px",
                          fontWeight: 600,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                        }}
                      >
                        {skill}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Card style={{ borderRadius: 12, position: "sticky", top: 24 }}>
              {appStatus?.applied ? (
                <div style={{ marginBottom: 16 }}>
                  <Alert
                    message="Application Submitted"
                    description={
                      appStatus.challengeId ? (
                        <div style={{ marginTop: 8 }}>
                          <Text>Your application is received. Please complete the coding challenge to proceed.</Text>
                          <Button
                            type="primary"
                            block
                            style={{ marginTop: 12, backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                            onClick={() => navigate(`/challenge/${appStatus.challengeId}?applicationId=${appStatus.applicationId}`)}
                          >
                            Take Coding Challenge
                          </Button>
                        </div>
                      ) : (
                        "Your application is currently being reviewed."
                      )
                    }
                    type="success"
                    showIcon
                  />
                </div>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleApplyClick}
                  loading={applying}
                  style={{
                    backgroundColor: "#ED1B2F",
                    borderColor: "#ED1B2F",
                    height: 48,
                    fontSize: 16,
                    marginBottom: 16,
                  }}
                >
                  Apply Now
                </Button>
              )}

              <Divider />

              <div style={{ marginBottom: 16 }}>
                <Text
                  strong
                  style={{ display: "block", marginBottom: 8, fontSize: 14 }}
                >
                  <TeamOutlined style={{ marginRight: 8 }} />
                  Company
                </Text>
                <Text style={{ fontSize: 16 }}>{job.company}</Text>
              </div>

              {job.contactEmail && (
                <div style={{ marginBottom: 16 }}>
                  <Text
                    strong
                    style={{ display: "block", marginBottom: 8, fontSize: 14 }}
                  >
                    Contact Email
                  </Text>
                  <Text style={{ fontSize: 16 }}>{job.contactEmail}</Text>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <Text
                  strong
                  style={{ display: "block", marginBottom: 8, fontSize: 14 }}
                >
                  Job Status
                </Text>
                <Tag color="green" style={{ fontSize: 14 }}>
                  {job.status || "Active"}
                </Tag>
              </div>

              {job.applicationDeadline && (
                <div>
                  <Text
                    strong
                    style={{ display: "block", marginBottom: 8, fontSize: 14 }}
                  >
                    Application Deadline
                  </Text>
                  <Text style={{ fontSize: 16 }}>
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Related Jobs Section */}
        <div style={{ marginTop: 60, marginBottom: 60 }}>
          <Title level={3} style={{ marginBottom: 24 }}>Related Jobs</Title>
          <RelatedJobs currentJobId={job._id} type={job.type} />
        </div>
      </div>

      <Modal
        title={`Apply for ${job.title}`}
        open={isApplyModalVisible}
        onCancel={() => setIsApplyModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsApplyModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={applying}
            onClick={handleApplySubmit}
            style={{ backgroundColor: "#ED1B2F", borderColor: "#ED1B2F" }}
            disabled={
              (applyType === "ONLINE" && !selectedCvId) ||
              (applyType === "UPLOAD" && !fileList.length)
            }
          >
            Submit Application
          </Button>,
        ]}
      >
        <Paragraph>Select how you want to apply:</Paragraph>
        <Radio.Group onChange={(e) => setApplyType(e.target.value)} value={applyType} style={{ width: "100%" }}>
          <Space direction="vertical" style={{ width: "100%" }}>

            {/* OPTION 1: PROFILE */}
            <Radio value="PROFILE">
              <Text strong>Easy Apply with Profile</Text>
              <div style={{ paddingLeft: 24, fontSize: 12, color: "#666" }}>
                Use your online profile data (Education, Experience, Skills) to apply instantly.
              </div>
            </Radio>

            {/* OPTION 2: ONLINE CV */}
            <Radio value="ONLINE">
              <Text strong>Apply with Online CV</Text>
              <div style={{ paddingLeft: 24, fontSize: 12, color: "#666" }}>
                Select one of your CVs created on TechTalent.
              </div>
              {applyType === "ONLINE" && (
                <div style={{ paddingLeft: 24, marginTop: 8, width: "100%" }}>
                  {loadingCVs ? (
                    <Spin size="small" />
                  ) : userCVs.length > 0 ? (
                    <Select
                      style={{ width: "100%" }}
                      placeholder="Select a CV"
                      onChange={(val) => setSelectedCvId(val)}
                      value={selectedCvId}
                    >
                      {userCVs.map(cv => (
                        <Select.Option key={cv._id} value={cv._id}>
                          {cv.title} {cv.isDefault && "(Default)"}
                        </Select.Option>
                      ))}
                    </Select>
                  ) : (
                    <div style={{ color: "orange" }}>
                      You don't have any online CVs. <Button type="link" size="small" onClick={() => navigate("/cv-builder")}>Create one</Button>
                    </div>
                  )}
                </div>
              )}
            </Radio>

            {/* OPTION 3: UPLOAD CV */}
            <Radio value="UPLOAD">
              <Text strong>Upload CV</Text>
              <div style={{ paddingLeft: 24, fontSize: 12, color: "#666" }}>
                Upload a PDF or Word file (Max 5MB).
              </div>
              {applyType === "UPLOAD" && (
                <div style={{ paddingLeft: 24, marginTop: 8 }}>
                  <Upload
                    beforeUpload={() => false} // Prevent auto upload
                    fileList={fileList}
                    onChange={({ fileList }) => {
                      // Limit to 1 file
                      setFileList(fileList.slice(-1));
                    }}
                    accept=".pdf,.doc,.docx"
                  >
                    <Button icon={<UploadOutlined />}>Click to Upload CV</Button>
                  </Upload>
                </div>
              )}
            </Radio>
          </Space>
        </Radio.Group>
      </Modal>
    </div>
  );
};

const RelatedJobs = ({ currentJobId, type }) => {
  const [relatedJobs, setRelatedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        // Fetch all jobs and filter client-side for now
        // Ideally backend should support /jobs?type=TYPE&exclude=ID
        const data = await jobService.getAllJobs();
        const allJobs = data.jobs || data || [];
        const filtered = allJobs
          .filter(j => j._id !== currentJobId && j.type === type)
          .slice(0, 3);
        setRelatedJobs(filtered);
      } catch (error) {
        console.error("Error fetching related jobs:", error);
      }
    };
    if (currentJobId) fetchRelated();
  }, [currentJobId, type]);

  if (relatedJobs.length === 0) return null;

  return (
    <Row gutter={[24, 24]}>
      {relatedJobs.map((job) => (
        <Col xs={24} md={8} key={job._id}>
          <Card
            hoverable
            onClick={() => navigate(`/jobs/${job.slug || job._id}`)}
            style={{ borderRadius: 12, height: "100%", border: "1px solid #f0f0f0" }}
          >
            <div style={{ marginBottom: 16 }}>
              <Title level={5} ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>{job.title}</Title>
              <Text type="secondary" style={{ color: "#ED1B2F", fontWeight: 500 }}>{job.company}</Text>
            </div>
            <div>
              <Tag>{job.location || "Remote"}</Tag>
              <Tag color="blue">{job.type?.replace("_", " ")}</Tag>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default JobDetailPage;
