export default function GradientBackground({ children }) {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            backgroundImage: `
        radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.1) 0px, transparent 50%), 
        radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.1) 0px, transparent 50%), 
        radial-gradient(at 52% 99%, hsla(355, 98%, 76%, 0.15) 0px, transparent 50%), 
        radial-gradient(at 10% 29%, hsla(256, 96%, 68%, 0.1) 0px, transparent 50%), 
        radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 0.1) 0px, transparent 50%), 
        radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 0.1) 0px, transparent 50%), 
        radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 0.1) 0px, transparent 50%)
      `,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat'
        }}>
            {children}
        </div>
    );
}
