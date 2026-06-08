import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
            <span className="material-symbols-outlined">school</span>
        </div>
    );
}
