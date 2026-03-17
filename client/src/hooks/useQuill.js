import { useCallback, useState, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

/**
 * A custom hook that replaces react-quilljs
 * to avoid "require is not defined" errors in Vite production builds.
 */
export const useQuill = (options = {}) => {
    const [quill, setQuill] = useState(null);
    const optionsRef = useRef(options);

    // Keep options in a ref to avoid unnecessary re-initializations
    // while keeping them available for the callback
    optionsRef.current = options;

    const quillRef = useCallback((node) => {
        if (node !== null && !node.classList.contains('ql-container')) {
            const q = new Quill(node, {
                theme: optionsRef.current.theme || 'snow',
                modules: optionsRef.current.modules || {
                    toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link', 'clean'],
                    ],
                },
                placeholder: optionsRef.current.placeholder || 'Write something...',
            });
            setQuill(q);
        }
    }, []);

    return { quill, quillRef };
};

export default useQuill;
