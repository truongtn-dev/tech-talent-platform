import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

/**
 * A custom hook that replaces react-quilljs
 * to avoid "require is not defined" errors in Vite production builds.
 */
export const useQuill = (options = {}) => {
    const quillRef = useRef(null);
    const [quill, setQuill] = useState(null);

    useEffect(() => {
        if (quillRef.current && !quill) {
            const editorContainer = quillRef.current;
            const q = new Quill(editorContainer, {
                theme: options.theme || 'snow',
                modules: options.modules || {
                    toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link', 'clean'],
                    ],
                },
                placeholder: options.placeholder || 'Write something...',
            });
            setQuill(q);
        }
    }, [quill, options.theme, options.placeholder, JSON.stringify(options.modules)]);

    return { quill, quillRef };
};

export default useQuill;
