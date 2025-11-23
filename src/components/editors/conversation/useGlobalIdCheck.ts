import { useMemo } from 'react';
import { useProjectStore } from '../../../store/useProjectStore';

export const useGlobalIdCheck = (currentFileId?: string) => {
    // 只订阅 conversationFiles
    const conversationFiles = useProjectStore((state) => state.conversationFiles);

    const globalIds = useMemo(() => {
        const ids = new Map<string, string[]>(); // ID -> List of filenames where it appears

        Object.values(conversationFiles).forEach(file => {
            if (file.id === currentFileId) return;

            // Regex to find top-level keys (node IDs)
            // Matches start of line, optional whitespace, optional quotes, identifier, optional quotes, colon
            const matches = file.content.match(/^\s*(?:["']?)([\w\-\.]+)(?:["']?)\s*:/gm);
            
            if (matches) {
                matches.forEach(m => {
                    // Extract ID: remove leading whitespace/quotes and trailing quotes/whitespace/colon
                    const id = m.replace(/^\s*["']?|["']?\s*:$/g, '');
                    if (id !== '__option__') {
                        const existing = ids.get(id) || [];
                        existing.push(file.name);
                        ids.set(id, existing);
                    }
                });
            }
        });
        return ids;
    }, [conversationFiles, currentFileId]);

    const checkDuplicate = (id: string) => {
        return globalIds.get(id);
    };

    return { checkDuplicate };
};
