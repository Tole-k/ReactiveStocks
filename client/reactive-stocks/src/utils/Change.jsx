export default function Change({ data, children }) {
    return (
        <p className={data >= 0 ? 'positive' : 'negative'}>
            {children}
        </p>
    );
}