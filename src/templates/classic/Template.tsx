/**
 * Classic template: a clean single-column resume.
 *
 * Templates use @react-pdf/renderer primitives (Document, Page, View, Text)
 * with a StyleSheet. Keep styles self-contained so the template stays portable.
 */

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { TemplateProps } from "../types";

const styles = StyleSheet.create({
  page: {
    paddingVertical: 36,
    paddingHorizontal: 44,
    fontSize: 10,
    lineHeight: 1.4,
    color: "#1f2937",
    fontFamily: "Helvetica",
  },
  name: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#111827" },
  headline: { fontSize: 11, color: "#4b5563", marginTop: 2 },
  contact: { fontSize: 9, color: "#6b7280", marginTop: 4 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginTop: 14,
    marginBottom: 4,
    borderBottom: "1px solid #d1d5db",
    paddingBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summary: { marginTop: 4 },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  expTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  expCompany: { color: "#374151" },
  period: { fontSize: 9, color: "#6b7280" },
  bullet: { flexDirection: "row", marginTop: 2 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1 },
  skills: { marginTop: 4 },
});

export default function ClassicTemplate({ model }: TemplateProps) {
  const contact = [
    model.contact.email,
    model.contact.phone,
    model.contact.location,
    ...model.contact.links,
  ]
    .filter(Boolean)
    .join("  •  ");

  return (
    <Document
      title={`${model.name} - Resume`}
      author={model.name}
      creator="hire-ready"
    >
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.name}>{model.name || "Your Name"}</Text>
          {model.headline ? (
            <Text style={styles.headline}>{model.headline}</Text>
          ) : null}
          {contact ? <Text style={styles.contact}>{contact}</Text> : null}
        </View>

        {model.summary ? (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{model.summary}</Text>
          </View>
        ) : null}

        {model.experiences.length ? (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {model.experiences.map((exp, i) => (
              <View key={i} wrap={false}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>
                    {exp.title}
                    {exp.company ? (
                      <Text style={styles.expCompany}> — {exp.company}</Text>
                    ) : null}
                  </Text>
                  {exp.period ? (
                    <Text style={styles.period}>{exp.period}</Text>
                  ) : null}
                </View>
                {exp.bullets.map((bullet, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {model.education.length ? (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {model.education.map((edu, i) => (
              <View key={i} style={styles.expHeader} wrap={false}>
                <Text style={styles.expTitle}>
                  {edu.school}
                  {edu.degree ? (
                    <Text style={styles.expCompany}> — {edu.degree}</Text>
                  ) : null}
                </Text>
                {edu.period ? (
                  <Text style={styles.period}>{edu.period}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {model.skills.length ? (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skills}>{model.skills.join("  •  ")}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
