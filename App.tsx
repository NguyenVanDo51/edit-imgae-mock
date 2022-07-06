import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import Button from 'antd/lib/button/button';
import React, { useState } from 'react';
import axios from 'axios';

const getBase64 = (file: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const App: React.FC = () => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState<any>([]);
  const [results, setResults] = useState<string[]>([]);

  const handleCancel = () => setPreviewVisible(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1)
    );
  };

  const handleChange: UploadProps['onChange'] = ({ file }) => {
    setFileList([...fileList, file]);
  };

  const startRemove: any = () => {
    let index: number = 0;
    let interval: any = null;
    interval = setInterval(() => {
      const data = new FormData();
      data.append('image', fileList[index]);

      const options = {
        method: 'POST',
        url: 'https://background-remover.p.rapidapi.com/remove-background',
        headers: {
          'X-RapidAPI-Key':
            '6ee92909eamsh3c62394d451d8f5p1c4225jsnef2f2faaf6d6',
          'X-RapidAPI-Host': 'background-remover.p.rapidapi.com',
          responseType: 'blob',
        },
        data: data,
      };

      axios
        .request(options)
        .then(async (response) => {
          console.log('image', response.data);
          // const url = await getBase64(response.data);
          setResults([...results, response.data]);
        })
        .catch(function (error) {
          console.error(error);
        });

      if (index < fileList.length - 1) {
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1500);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div>
      <h1>Drag and Drop or browse your files</h1>

      <Upload
        capture=""
        action=""
        listType="picture-card"
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={(file: any) => {
          return false;
        }}
        showUploadList={{ showDownloadIcon: true }}
        maxCount={1}
      >
        {fileList.length >= 1 ? null : uploadButton}
      </Upload>

      <Button onClick={startRemove}>Start</Button>

      {results.map((src: string) => (
        <img alt="example" style={{ width: '100%' }} src={src} />
      ))}

      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default App;
