package main

import (
	"fmt"
	"os"

	"github.com/gocolly/colly/v2"
)

func main() {
	_ = os.Mkdir(".cache", os.ModePerm)

	c := colly.NewCollector(colly.AllowedDomains("github.com"), colly.CacheDir((".cache")))

	// Find and visit all links
	c.OnHTML("a[href]", func(e *colly.HTMLElement) {
		nextUrl := e.Attr("href")

		e.Request.Visit(nextUrl)
	})

	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})

	c.Visit("https://github.com/swc-project/swc/network/dependents?package_id=UGFja2FnZS00Njc1MTk4MDQ%3D")
}
