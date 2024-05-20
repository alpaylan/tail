import HomePage from '@/components/HomePage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Tail",
    description: "Next Generation Document Builder",
    keywords: ["document", "resume", "builder", "app"],
};


const App = () => {
    return <HomePage />;
}

export default App;