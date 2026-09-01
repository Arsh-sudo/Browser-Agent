const STEPS = [
  { title: "Click the puzzle-piece icon", detail: "It's near the top-right of Chrome, next to the address bar." },
  { title: "Find “Visual Perception Agent”", detail: "It'll be in the dropdown list of installed extensions." },
  { title: "Click the pin next to it", detail: "The icon now stays visible in your toolbar, one click away." },
];

export default function Onboarding() {
  return (
    <div className="onboarding">
      <div className="onboarding__card">
        <header className="onboarding__header">
          <div className="onboarding__icon" aria-hidden />
          <div>
            <h1>Visual Perception Agent is installed</h1>
            <p className="onboarding__subtitle">
              Give it a task from the toolbar icon and it reads the page, redacts anything sensitive, and only then
              asks the server what to do next. One quick step below keeps it handy.
            </p>
          </div>
        </header>

        <div className="onboarding__status">
          <span className="onboarding__status-dot" aria-hidden />
          <div>
            <strong>Ready when you are</strong>
            <p>Nothing runs until you open the extension and type a task — it doesn't watch pages in the background.</p>
          </div>
        </div>

        <section className="onboarding__section">
          <h2>Pin it to your toolbar</h2>
          <p className="onboarding__section-lede">
            Chrome hides new extensions by default. Pin it so you can start a task or check the redaction log without
            digging through a menu.
          </p>
          <ol className="onboarding__steps">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="onboarding__step-index">{i + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="onboarding__section">
          <h2>What it does</h2>
          <ul className="onboarding__bullets">
            <li>Reads the current page's structure locally — buttons, fields, links — to figure out what's on screen.</li>
            <li>Finds anything sensitive (passwords, emails, personal text) and redacts it before any network call.</li>
            <li>Sends only the sanitized, non-identifying context to the server to decide the next action.</li>
            <li>Shows you exactly what was redacted, and where, in the side panel — nothing is hidden from you.</li>
          </ul>
        </section>

        <footer className="onboarding__footer">
          <strong>Private by design.</strong> Screen reading and redaction happen on your device. Only sanitized
          context leaves the browser, and only while a task is running — never in the background.
        </footer>
      </div>
    </div>
  );
}
