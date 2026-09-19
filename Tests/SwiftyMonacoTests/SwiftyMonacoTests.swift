import XCTest
@testable import SwiftyMonaco

final class SwiftyMonacoTests: XCTestCase {
    func testMimeTypeSyntaxHighlight() {
        let syntax = SyntaxHighlight(mimeType: "application/json")

        guard case .mimeType(let mimeType) = syntax.languageSelector else {
            return XCTFail("Expected a MIME type selector")
        }
        XCTAssertEqual(mimeType, "application/json")
    }

    func testFileExtensionSyntaxHighlightAddsLeadingPeriod() {
        let syntax = SyntaxHighlight(fileExtension: "swift")

        guard case .fileExtension(let fileExtension) = syntax.languageSelector else {
            return XCTFail("Expected a file extension selector")
        }
        XCTAssertEqual(fileExtension, ".swift")
    }

    func testFileExtensionSyntaxHighlightPreservesLeadingPeriod() {
        let syntax = SyntaxHighlight(fileExtension: ".ts")

        guard case .fileExtension(let fileExtension) = syntax.languageSelector else {
            return XCTFail("Expected a file extension selector")
        }
        XCTAssertEqual(fileExtension, ".ts")
    }

    static var allTests = [
        ("testMimeTypeSyntaxHighlight", testMimeTypeSyntaxHighlight),
        ("testFileExtensionSyntaxHighlightAddsLeadingPeriod", testFileExtensionSyntaxHighlightAddsLeadingPeriod),
        ("testFileExtensionSyntaxHighlightPreservesLeadingPeriod", testFileExtensionSyntaxHighlightPreservesLeadingPeriod),
    ]
}
