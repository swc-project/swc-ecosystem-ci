package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/gocolly/colly/v2"
)

var blocked = []string{
	"/orgs",
	"/site",
	"/topics",
	"/about",
	"/readme",
	"/login",
	"/signup",
	"/features",
	"/trending",
	"/enterprise",
	"/customer-stories",
	"/roadmap",
}

func main() {
	_ = os.Mkdir(".cache", os.ModePerm)

	c := colly.NewCollector(colly.AllowedDomains("github.com"), colly.CacheDir((".cache")))

	// Find and visit all links
	c.OnHTML("a[data-hovercard-type=repository]", func(e *colly.HTMLElement) {

		nextUrl := e.Attr("href")

		for _, b := range blocked {
			if strings.Contains(nextUrl, b) {
				return
			}
		}

		e.Request.Visit(nextUrl)
	})

	// Find and visit all links
	c.OnHTML(".paginate-container a[href]", func(e *colly.HTMLElement) {

		nextUrl := e.Attr("href")

		for _, b := range blocked {
			if strings.Contains(nextUrl, b) {
				return
			}
		}

		e.Request.Visit(nextUrl)
	})

	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})

	c.Visit("https://github.com/swc-project/swc/network/dependents?package_id=UGFja2FnZS00Njc1MTk4MDQ%3D")
}
