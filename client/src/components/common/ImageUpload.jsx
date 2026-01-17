import { useState } from 'react';
import { Upload, message, Button } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import http from '../../services/http';

const ImageUpload = ({ value, onChange, placeholder = "Upload Image" }) => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(value);

    // Triggered when value prop changes (e.g. form reset or initial load)
    if (value && value !== imageUrl) {
        setImageUrl(value);
    }

    const customRequest = async ({ file, onSuccess, onError }) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            // Adjust endpoint as needed. Assuming /upload route exists on server
            // If not, we need to create it. For now, assuming standard upload.
            const res = await http.post('/uploads/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Assuming response returns { url: "..." }
            const url = res.url || res.data?.url;
            setImageUrl(url);
            onChange(url); // Propagate to Form
            message.success('Image uploaded successfully');
            onSuccess("ok");
        } catch (err) {
            console.error(err);
            message.error('Upload failed');
            onError({ err });
        } finally {
            setLoading(false);
        }
    };

    const uploadButton = (
        <Button icon={loading ? <LoadingOutlined /> : <UploadOutlined />}>
            {loading ? 'Uploading...' : placeholder}
        </Button>
    );

    return (
        <div className="image-uploader">
            <Upload
                customRequest={customRequest}
                showUploadList={false}
                accept="image/*"
            >
                {imageUrl ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            src={imageUrl}
                            alt="thumbnail"
                            style={{ maxWidth: '100%', borderRadius: 8, display: 'block', marginBottom: 8 }}
                        />
                        <Button
                            size="small"
                            style={{ position: 'absolute', top: 8, right: 8 }}
                            onClick={(e) => { e.stopPropagation(); }}
                        >Change</Button>
                    </div>
                ) : uploadButton}
            </Upload>
            {imageUrl && (
                <div style={{ marginTop: 8 }}>
                    <Button danger size="small" onClick={() => { setImageUrl(""); onChange(""); }}>Remove</Button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
