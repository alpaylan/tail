import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {children}
        </div>
    )
}

export default Layout;