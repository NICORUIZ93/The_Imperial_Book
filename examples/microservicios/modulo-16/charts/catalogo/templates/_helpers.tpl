{{/* Nombre completo: <release>-catalogo, recortado a 63 caracteres (límite de los nombres DNS). */}}
{{- define "catalogo.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Etiquetas recomendadas por Kubernetes (app.kubernetes.io/*). */}}
{{- define "catalogo.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Values.image.tag | default .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version }}
{{- end -}}

{{/* Selector: solo etiquetas que NUNCA cambian (el selector de un Deployment es inmutable). */}}
{{- define "catalogo.selector" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
