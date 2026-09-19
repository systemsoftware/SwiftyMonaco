(function () {
    function toLSPPosition(position) {
        return { line: position.lineNumber - 1, character: position.column - 1 };
    }

    function toMonacoRange(range) {
        return {
            startLineNumber: range.start.line + 1,
            startColumn: range.start.character + 1,
            endLineNumber: range.end.line + 1,
            endColumn: range.end.character + 1
        };
    }

    function markdown(value) {
        if (typeof value === 'string') return { value: value };
        if (value && typeof value.value === 'string') return { value: value.value };
        return { value: '' };
    }

    function completionKind(kind) {
        const kinds = [
            monaco.languages.CompletionItemKind.Text,
            monaco.languages.CompletionItemKind.Method,
            monaco.languages.CompletionItemKind.Function,
            monaco.languages.CompletionItemKind.Constructor,
            monaco.languages.CompletionItemKind.Field,
            monaco.languages.CompletionItemKind.Variable,
            monaco.languages.CompletionItemKind.Class,
            monaco.languages.CompletionItemKind.Interface,
            monaco.languages.CompletionItemKind.Module,
            monaco.languages.CompletionItemKind.Property,
            monaco.languages.CompletionItemKind.Unit,
            monaco.languages.CompletionItemKind.Value,
            monaco.languages.CompletionItemKind.Enum,
            monaco.languages.CompletionItemKind.Keyword,
            monaco.languages.CompletionItemKind.Snippet,
            monaco.languages.CompletionItemKind.Color,
            monaco.languages.CompletionItemKind.File,
            monaco.languages.CompletionItemKind.Reference,
            monaco.languages.CompletionItemKind.Folder,
            monaco.languages.CompletionItemKind.EnumMember,
            monaco.languages.CompletionItemKind.Constant,
            monaco.languages.CompletionItemKind.Struct,
            monaco.languages.CompletionItemKind.Event,
            monaco.languages.CompletionItemKind.Operator,
            monaco.languages.CompletionItemKind.TypeParameter
        ];
        return kinds[kind - 1] === undefined ? monaco.languages.CompletionItemKind.Text : kinds[kind - 1];
    }

    function markerSeverity(severity) {
        switch (severity) {
        case 1: return monaco.MarkerSeverity.Error;
        case 2: return monaco.MarkerSeverity.Warning;
        case 3: return monaco.MarkerSeverity.Info;
        case 4: return monaco.MarkerSeverity.Hint;
        default: return monaco.MarkerSeverity.Info;
        }
    }

    class LanguageServerClient {
        constructor(configuration) {
            this.configuration = configuration;
            this.nextRequestID = 1;
            this.pendingRequests = new Map();
            this.version = 1;
            this.disposables = [];
        }

        connect() {
            const model = window.editor.editor.getModel();
            this.model = model;
            this.socket = new WebSocket(this.configuration.url);
            this.socket.addEventListener('message', event => this.receive(event.data));
            this.socket.addEventListener('open', async () => {
                const result = await this.request('initialize', {
                    processId: null,
                    rootUri: this.configuration.workspaceRootURI,
                    capabilities: {
                        textDocument: {
                            synchronization: { didSave: false },
                            completion: { completionItem: { snippetSupport: true } },
                            hover: { contentFormat: ['markdown', 'plaintext'] },
                            publishDiagnostics: {}
                        }
                    },
                    workspaceFolders: this.configuration.workspaceRootURI ? [{
                        uri: this.configuration.workspaceRootURI,
                        name: this.configuration.workspaceRootURI.split('/').pop() || 'workspace'
                    }] : null
                });
                this.capabilities = result.capabilities || {};
                this.notify('initialized', {});
                this.notify('textDocument/didOpen', {
                    textDocument: {
                        uri: this.configuration.documentURI,
                        languageId: model.getModeId(),
                        version: this.version,
                        text: model.getValue()
                    }
                });
                this.registerProviders();
                this.disposables.push(model.onDidChangeContent(event => this.didChange(event)));
            });
        }

        send(message) {
            this.socket.send(JSON.stringify(message));
        }

        request(method, params) {
            const id = this.nextRequestID++;
            this.send({ jsonrpc: '2.0', id: id, method: method, params: params });
            return new Promise((resolve, reject) => this.pendingRequests.set(id, { resolve, reject }));
        }

        notify(method, params) {
            this.send({ jsonrpc: '2.0', method: method, params: params });
        }

        receive(payload) {
            const message = JSON.parse(payload);
            if (message.id !== undefined && this.pendingRequests.has(message.id)) {
                const pending = this.pendingRequests.get(message.id);
                this.pendingRequests.delete(message.id);
                message.error ? pending.reject(message.error) : pending.resolve(message.result);
            } else if (message.method === 'textDocument/publishDiagnostics') {
                this.publishDiagnostics(message.params);
            } else if (message.id !== undefined) {
                this.send({ jsonrpc: '2.0', id: message.id, result: null });
            }
        }

        didChange() {
            this.version += 1;
            this.notify('textDocument/didChange', {
                textDocument: { uri: this.configuration.documentURI, version: this.version },
                contentChanges: [{ text: this.model.getValue() }]
            });
        }

        registerProviders() {
            const language = this.model.getModeId();
            if (this.capabilities.completionProvider) {
                this.disposables.push(monaco.languages.registerCompletionItemProvider(language, {
                    triggerCharacters: this.capabilities.completionProvider.triggerCharacters || [],
                    provideCompletionItems: async (model, position, context) => {
                        const response = await this.request('textDocument/completion', {
                            textDocument: { uri: this.configuration.documentURI },
                            position: toLSPPosition(position),
                            context: { triggerKind: context.triggerKind, triggerCharacter: context.triggerCharacter }
                        });
                        const items = Array.isArray(response) ? response : (response && response.items) || [];
                        return { suggestions: items.map(item => this.completionItem(item)) };
                    }
                }));
            }
            if (this.capabilities.hoverProvider) {
                this.disposables.push(monaco.languages.registerHoverProvider(language, {
                    provideHover: async (model, position) => {
                        const hover = await this.request('textDocument/hover', {
                            textDocument: { uri: this.configuration.documentURI },
                            position: toLSPPosition(position)
                        });
                        if (!hover) return null;
                        const contents = Array.isArray(hover.contents) ? hover.contents : [hover.contents];
                        return {
                            contents: contents.map(markdown),
                            range: hover.range ? toMonacoRange(hover.range) : undefined
                        };
                    }
                }));
            }
        }

        completionItem(item) {
            const suggestion = Object.assign({}, item);
            suggestion.kind = completionKind(item.kind || 1);
            if (item.textEdit) {
                suggestion.insertText = item.textEdit.newText;
                suggestion.range = toMonacoRange(item.textEdit.range);
                delete suggestion.textEdit;
            } else {
                suggestion.insertText = item.insertText || item.label;
            }
            if (item.insertTextFormat === 2) {
                suggestion.insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
            }
            if (item.documentation) suggestion.documentation = markdown(item.documentation);
            return suggestion;
        }

        publishDiagnostics(params) {
            if (params.uri !== this.configuration.documentURI) return;
            const markers = (params.diagnostics || []).map(diagnostic => {
                const range = toMonacoRange(diagnostic.range);
                return Object.assign(range, {
                    message: diagnostic.message,
                    severity: markerSeverity(diagnostic.severity),
                    code: diagnostic.code == null ? undefined : String(diagnostic.code),
                    source: diagnostic.source
                });
            });
            monaco.editor.setModelMarkers(this.model, 'language-server', markers);
        }
    }

    window.SwiftyMonacoLanguageServer = {
        connect: function (configuration) {
            const client = new LanguageServerClient(configuration);
            client.connect();
            return client;
        }
    };
})();
