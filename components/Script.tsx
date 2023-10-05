export default ({ code }: { code: string }) => (
  <script
    dangerouslySetInnerHTML={{
      __html: code,
    }}
  />
);
