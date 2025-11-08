import React from 'react';

const BeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.625h4.5v-5.625a.563.563 0 00-.438-.549l-1.875-.5a.563.563 0 00-.625 0l-1.875.5A.563.563 0 009.75 3.104zm0 5.625h4.5M9.75 12.375h4.5m-4.5 3.375h4.5m-4.5 3.375h4.5M3.375 5.625c0-1.036.84-1.875 1.875-1.875h.375m13.5 0h.375c1.036 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875h-13.5c-1.036 0-1.875-.84-1.875-1.875V5.625z" />
    </svg>
);

export default BeakerIcon;