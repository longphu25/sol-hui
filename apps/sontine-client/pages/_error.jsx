function ErrorPage({ statusCode }) {
  return (
    <html lang="en">
      <body>
        <h1>{statusCode ?? 500} - Something went wrong</h1>
      </body>
    </html>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
