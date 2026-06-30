/**
 * Modern template: two-column layout with an accent sidebar.
 */

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { TemplateProps } from "../types";

const ACCENT = "#2563eb";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#1f2937",
    fontFamily: "Helvetica",
  },
  sidebar: {
    width: "32%",
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    paddingVertical: 30,
    paddingHorizontal: 18,
  },
  main: {
    width: "68%",
    paddingVertical: 30,
    paddingHorizontal: 24,
  },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  headline: { fontSize: 10, color: "#94a3b8", marginTop: 4 },
  sidebarTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    marginTop: 18,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sidebarItem: { fontSize: 9, color: "#cbd5e1", marginBottom: 3 },
  skillChip: { fontSize: 9, color: "#e2e8f0", marginBottom: 3 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginTop: 14,
    marginBottom: 4,
  },
  accentBar: {
    width: 28,
    height: 3,
    backgroundColor: ACCENT,
    marginBottom: 6,
  },
  summary: { marginTop: 2 },
  expHeader: { marginTop: 8 },
  expTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: "#111827" },
  expCompany: { color: ACCENT, fontSize: 10 },
  period: { fontSize: 8.5, color: "#6b7280", marginBottom: 2 },
  bullet: { flexDirection: "row", marginTop: 2 },
  bulletDot: { width: 10, color: ACCENT },
  bulletText: { flex: 1 },
});

export default function ModernTemplate({ model }: TemplateProps) {
  const contactItems = [
    model.contact.email,
    model.contact.phone,
    model.contact.location,
    ...model.contact.links,
  ].filter(Boolean) as string[];

  return (
    <Document
      title={`${model.name} - Resume`}
      author={model.name}
      creator="hire-ready"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.sidebar}>
          <Text style={styles.name}>{model.name || "Your Name"}</Text>
          {model.headline ? (
            <Text style={styles.headline}>{model.headline}</Text>
          ) : null}

          {contactItems.length ? (
            <View>
              <Text style={styles.sidebarTitle}>Contact</Text>
              {contactItems.map((item, i) => (
                <Text key={i} style={styles.sidebarItem}>
                  {item}
                </Text>
              ))}
            </View>
          ) : null}

          {model.skills.length ? (
            <View>
              <Text style={styles.sidebarTitle}>Skills</Text>
              {model.skills.map((skill, i) => (
                <Text key={i} style={styles.skillChip}>
                  {skill}
                </Text>
              ))}
            </View>
          ) : null}

          {model.education.length ? (
            <View>
              <Text style={styles.sidebarTitle}>Education</Text>
              {model.education.map((edu, i) => (
                <View key={i}>
                  <Text style={styles.sidebarItem}>{edu.school}</Text>
                  {edu.degree ? (
                    <Text style={styles.sidebarItem}>{edu.degree}</Text>
                  ) : null}
                  {edu.period ? (
                    <Text style={styles.sidebarItem}>{edu.period}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.main}>
          {model.summary ? (
            <View>
              <Text style={styles.sectionTitle}>Profile</Text>
              <View style={styles.accentBar} />
              <Text style={styles.summary}>{model.summary}</Text>
            </View>
          ) : null}

          {model.experiences.length ? (
            <View>
              <Text style={styles.sectionTitle}>Experience</Text>
              <View style={styles.accentBar} />
              {model.experiences.map((exp, i) => (
                <View key={i} style={styles.expHeader} wrap={false}>
                  <Text style={styles.expTitle}>{exp.title}</Text>
                  {exp.company ? (
                    <Text style={styles.expCompany}>{exp.company}</Text>
                  ) : null}
                  {exp.period ? (
                    <Text style={styles.period}>{exp.period}</Text>
                  ) : null}
                  {exp.bullets.map((bullet, j) => (
                    <View key={j} style={styles.bullet}>
                      <Text style={styles.bulletDot}>›</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
