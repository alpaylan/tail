
import FreeFormLayoutEditor from '@/components/FreeFormLayoutEditor';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Freeform",
    description: "Next Generation Document Builder",
    keywords: ["document", "resume", "builder", "app"],
};


const App = () => {
    return <FreeFormLayoutEditor />;
}

export default App;